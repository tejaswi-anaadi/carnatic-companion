import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'

// ---------------------------------------------------------------------------
// Module-scoped singleton AudioContext.
//
// Why a singleton: every component that calls useAudioEngine() used to spin
// up its own AudioContext. After a few tab switches (Ragas -> Talas ->
// Ragas) browsers run out of allowed contexts, and previously-created ones
// can drift into the 'suspended' / 'interrupted' states with no obvious
// recovery path — which is exactly the "sound just stops working, refresh
// doesn't help" symptom the user reported.
//
// We share ONE context across the whole app, eagerly resume it on every
// playback call, clamp scheduled events to never land in the past, and
// listen for visibilitychange to nudge the context back to running when
// the tab returns to the foreground.
// ---------------------------------------------------------------------------

// Per-note volume for swara playback (playSequence / playNotes /
// playFrequencies). Bumped from 0.32 → 0.45 (~+3 dB) after user feedback
// that the previous level felt too quiet on laptop speakers.
const SWARA_VOL = 0.45

let CTX = null
let MASTER = null
let ACTIVE_CANCEL = null
let NOISE_BUFFER = null

// "Tracker" sink for the currently-active playback session. When a
// playback method (playSequence/playFrequencies/playNotes) wants to
// capture every oscillator it creates so it can yank them on stop(), it
// installs an array here for the duration of its scheduling pass. Any
// scheduleTone/scheduleClick call that happens while ACTIVE_TRACKER is
// non-null pushes its source nodes into the array.
//
// This is the missing half of "stop": the audio events were being
// scheduled directly on the AudioContext timeline via osc.start(t0) /
// osc.stop(t0+dur), so cancelling JS setTimeouts only stopped the
// highlight callbacks. The notes themselves played to completion. Now,
// on cancel, we walk the tracker and force-stop every still-pending
// oscillator with a brief fade.
let ACTIVE_TRACKER = null

function getOrCreateCtx() {
  if (!CTX) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) {
      throw new Error('Web Audio API not supported in this browser')
    }
    CTX = new Ctor({ latencyHint: 'interactive' })
    MASTER = CTX.createGain()
    MASTER.gain.value = 0.95
    MASTER.connect(CTX.destination)
  }
  return CTX
}

// Defensive: tear-down + rebuild MASTER → destination. Safari especially
// can drop the master gain's connection to destination after the page
// goes to bg/fg or after long idle, leaving us scheduling oscillators
// into a sink that goes nowhere — symptom: "no sound, anywhere".
// Calling disconnect() on an already-disconnected node is a no-op (it
// throws InvalidAccessError, which we swallow). Re-connecting is cheap
// and makes the graph deterministic at every play.
function ensureMasterConnected(ctx) {
  if (!MASTER) return
  try { MASTER.disconnect(ctx.destination) } catch (_e) { /* not connected */ }
  try { MASTER.connect(ctx.destination) } catch (_e) { /* already connected somehow */ }
  // Also guarantee gain isn't stuck at 0 from a stale envelope on the
  // master itself (we don't normally ramp MASTER, but being explicit).
  try {
    const now = ctx.currentTime
    MASTER.gain.cancelScheduledValues(now)
    MASTER.gain.setValueAtTime(0.95, now)
  } catch (_e) { /* ignore */ }
}

async function ensureRunning() {
  const ctx = getOrCreateCtx()
  if (ctx.state !== 'running') {
    try {
      await ctx.resume()
    } catch (e) {
      console.warn('[audio] resume() failed:', e?.message ?? e)
    }
  }
  ensureMasterConnected(ctx)
  return ctx
}

if (typeof document !== 'undefined') {
  const wake = () => {
    if (CTX && CTX.state !== 'running') {
      CTX.resume().catch(() => { /* ignored */ })
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') wake()
  })
  window.addEventListener('focus', wake)
  window.addEventListener('pageshow', wake)
}

function safeAt(ctx, at) {
  return Math.max(at, ctx.currentTime + 0.005)
}

// Lazily-built mono white-noise buffer reused by every kattai/jalra hit.
// 0.5s is plenty — the longest jalra ring is ~0.4s. Rebuild only if the
// AudioContext got recreated with a different sampleRate (rare).
function getNoiseBuffer(ctx) {
  if (NOISE_BUFFER && NOISE_BUFFER.sampleRate === ctx.sampleRate) return NOISE_BUFFER
  const len = Math.floor(ctx.sampleRate * 0.5)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  NOISE_BUFFER = buf
  return buf
}

// Per-role tonal/dynamic profile for the natural-percussion voices.
// Carnatic semantics:
//   main     = samam / start-of-anga clap → loud, full-pitched
//   sub-main = drutam wave or laghu finger count → softer, lower
//   sub      = subdivision tick (between beats) — very quiet, brief
function kattaiProfile(role) {
  if (role === 'main')     return { mid: 1500, low: 520, vol: 1.00, dur: 0.13 }
  if (role === 'sub-main') return { mid: 1100, low: 380, vol: 0.55, dur: 0.10 }
  if (role === 'sub')      return { mid: 1300, low: 440, vol: 0.18, dur: 0.05 }
  return null
}

function jalraProfile(role) {
  if (role === 'main')     return { baseHz: 2400, vol: 0.55, dur: 0.45 }
  if (role === 'sub-main') return { baseHz: 1700, vol: 0.30, dur: 0.30 }
  if (role === 'sub')      return { baseHz: 2100, vol: 0.10, dur: 0.10 }
  return null
}

// Fade-and-stop a single tracked source. The brief linear ramp avoids the
// "click" you'd hear from yanking a running oscillator instantaneously.
// Wrapped in try/catch because the source may already have stopped on
// its own by the time we get here.
function killSource({ osc, gain, scheduledEnd }) {
  if (!osc) return
  const ctx = CTX
  if (!ctx) return
  const now = ctx.currentTime
  // Already finished — nothing to do.
  if (scheduledEnd != null && scheduledEnd <= now) return
  const FADE = 0.015
  try {
    gain.gain.cancelScheduledValues(now)
    // Pin whatever the gain is right now so the ramp starts from the
    // current envelope position, not from a stale scheduled value.
    const cur = gain.gain.value
    gain.gain.setValueAtTime(cur, now)
    gain.gain.linearRampToValueAtTime(0.0001, now + FADE)
    osc.stop(now + FADE + 0.005)
  } catch (_e) {
    // Already-stopped oscillators throw on .stop() — ignore.
  }
}

function killAllSources(sources) {
  if (!sources || sources.length === 0) return
  for (const s of sources) killSource(s)
  sources.length = 0
}

export function useAudioEngine() {
  const cancelRef = useRef(null)

  const ensureCtx = useCallback(() => {
    ensureRunning()
    return getOrCreateCtx()
  }, [])

  const scheduleTone = useCallback((at, freq, durSec, type = 'triangle', vol = 0.3) => {
    const ctx = getOrCreateCtx()
    const t0 = safeAt(ctx, at)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    const attack = 0.01
    const release = Math.min(0.08, durSec * 0.4)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + attack)
    gain.gain.setValueAtTime(vol, t0 + Math.max(attack, durSec - release))
    gain.gain.linearRampToValueAtTime(0.0001, t0 + durSec)
    osc.connect(gain)
    gain.connect(MASTER)
    const scheduledEnd = t0 + durSec + 0.05
    osc.start(t0)
    osc.stop(scheduledEnd)
    const handle = { osc, gain, scheduledEnd }
    if (ACTIVE_TRACKER) ACTIVE_TRACKER.push(handle)
    return handle
  }, [])

  const scheduleClick = useCallback((at, kind = 'clap') => {
    const ctx = getOrCreateCtx()
    const t0 = safeAt(ctx, at)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'

    let freq, q, vol, dur
    switch (kind) {
      case 'clap':
        osc.type = 'square'; freq = 1400; q = 4; vol = 0.95; dur = 0.07; break
      case 'wave':
        osc.type = 'sine'; freq = 520; q = 2; vol = 0.85; dur = 0.12; break
      case 'finger-1':
      case 'finger-2':
      case 'finger-3':
      case 'finger-4':
      case 'finger-5':
        osc.type = 'triangle'
        freq = 700 + (parseInt(kind.split('-')[1]) - 1) * 80
        q = 3; vol = 0.7; dur = 0.06; break
      case 'sub':
      default:
        osc.type = 'sine'; freq = 2200; q = 8; vol = 0.32; dur = 0.025; break
    }

    osc.frequency.setValueAtTime(freq, t0)
    filter.frequency.setValueAtTime(freq, t0)
    filter.Q.value = q
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(MASTER)
    const scheduledEnd = t0 + dur + 0.02
    osc.start(t0)
    osc.stop(scheduledEnd)
    const handle = { osc, gain, scheduledEnd }
    if (ACTIVE_TRACKER) ACTIVE_TRACKER.push(handle)
    return handle
  }, [])

  // ---- Natural percussion voices --------------------------------------
  // Each returns an array of {osc, gain, scheduledEnd} handles so callers
  // can track every node for stop() / killAllSources(). Returns [] for
  // unsupported roles (e.g. 'sub' on kattai/jalra) so the metronome can
  // safely skip silently.

  // Kattai = wooden block (Bharatanatyam practice clappers).
  //
  // Earlier version used a clean triangle oscillator for the pitched body;
  // that gave it a synthetic "tonal" quality which the user correctly
  // identified as electronic-sounding. Real wood blocks have NO clean
  // sustained pitch — the "tonk" comes from a few damped resonant modes
  // ringing on top of a broadband impact.
  //
  // New synthesis (all noise-based, no oscillators):
  //   * mid resonance: noise → high-Q bandpass at ~1.5 kHz → main "tonk"
  //   * low resonance: noise → bandpass at ~520 Hz → wood body warmth
  //   * attack click:  brief highpass-filtered noise transient (~8 ms)
  //
  // Per-hit detune (±3%) of the resonance frequencies so consecutive
  // strikes don't sound machine-identical — that subtle variation is most
  // of what reads as "natural".
  const scheduleKattai = useCallback((at, role = 'main') => {
    const profile = kattaiProfile(role)
    if (!profile) return []
    const ctx = getOrCreateCtx()
    const t0 = safeAt(ctx, at)
    const { mid, low, vol, dur } = profile
    const detune = () => 1 + (Math.random() - 0.5) * 0.06 // ±3%
    const handles = []

    // Mid-frequency wood mode — the main pitched character of the "tonk"
    const noiseMid = ctx.createBufferSource()
    noiseMid.buffer = getNoiseBuffer(ctx)
    const bpMid = ctx.createBiquadFilter()
    bpMid.type = 'bandpass'
    bpMid.frequency.setValueAtTime(mid * detune(), t0)
    bpMid.Q.value = 11
    const gMid = ctx.createGain()
    gMid.gain.setValueAtTime(0, t0)
    gMid.gain.linearRampToValueAtTime(vol * 0.95, t0 + 0.001)
    gMid.gain.exponentialRampToValueAtTime(0.0005, t0 + dur)
    noiseMid.connect(bpMid); bpMid.connect(gMid); gMid.connect(MASTER)
    const midEnd = t0 + dur + 0.04
    noiseMid.start(t0); noiseMid.stop(midEnd)
    handles.push({ osc: noiseMid, gain: gMid, scheduledEnd: midEnd })

    // Low-frequency wood mode — body warmth, decays slightly faster
    const noiseLow = ctx.createBufferSource()
    noiseLow.buffer = getNoiseBuffer(ctx)
    const bpLow = ctx.createBiquadFilter()
    bpLow.type = 'bandpass'
    bpLow.frequency.setValueAtTime(low * detune(), t0)
    bpLow.Q.value = 8
    const gLow = ctx.createGain()
    gLow.gain.setValueAtTime(0, t0)
    gLow.gain.linearRampToValueAtTime(vol * 0.55, t0 + 0.002)
    gLow.gain.exponentialRampToValueAtTime(0.0005, t0 + dur * 0.85)
    noiseLow.connect(bpLow); bpLow.connect(gLow); gLow.connect(MASTER)
    const lowEnd = t0 + dur + 0.04
    noiseLow.start(t0); noiseLow.stop(lowEnd)
    handles.push({ osc: noiseLow, gain: gLow, scheduledEnd: lowEnd })

    // Attack transient — broadband, very short, gives the strike its bite
    const noiseAtk = ctx.createBufferSource()
    noiseAtk.buffer = getNoiseBuffer(ctx)
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(900, t0)
    const gAtk = ctx.createGain()
    gAtk.gain.setValueAtTime(0, t0)
    gAtk.gain.linearRampToValueAtTime(vol * 0.45, t0 + 0.0005)
    gAtk.gain.exponentialRampToValueAtTime(0.0003, t0 + 0.008)
    noiseAtk.connect(hp); hp.connect(gAtk); gAtk.connect(MASTER)
    const atkEnd = t0 + 0.014
    noiseAtk.start(t0); noiseAtk.stop(atkEnd)
    handles.push({ osc: noiseAtk, gain: gAtk, scheduledEnd: atkEnd })

    if (ACTIVE_TRACKER) handles.forEach((h) => ACTIVE_TRACKER.push(h))
    return handles
  }, [])

  // Jalra = small hand cymbals. Bell-like: inharmonic sine partials with
  // a long exponential decay, plus a brief high-frequency noise sting at
  // the attack for the metallic "ching".
  const scheduleJalra = useCallback((at, role = 'main') => {
    const profile = jalraProfile(role)
    if (!profile) return []
    const ctx = getOrCreateCtx()
    const t0 = safeAt(ctx, at)
    const { baseHz, vol, dur } = profile
    const handles = []

    // Inharmonic partial ratios — pseudo-bell, not strict harmonics. The
    // perceived pitch is the lowest one but the upper partials give the
    // "ching" character.
    const ratios = [1, 1.687, 2.503, 3.412, 4.832]
    ratios.forEach((r, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(baseHz * r, t0)
      const partialVol = vol * (i === 0 ? 1 : 0.55 / (i + 1))
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(partialVol, t0 + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0003, t0 + dur)
      o.connect(g); g.connect(MASTER)
      const end = t0 + dur + 0.05
      o.start(t0); o.stop(end)
      handles.push({ osc: o, gain: g, scheduledEnd: end })
    })

    // Highpass noise burst — short metallic sting at the attack
    const noise = ctx.createBufferSource()
    noise.buffer = getNoiseBuffer(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(2500, t0)
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0, t0)
    ng.gain.linearRampToValueAtTime(vol * 0.4, t0 + 0.001)
    ng.gain.exponentialRampToValueAtTime(0.0003, t0 + 0.05)
    noise.connect(filter); filter.connect(ng); ng.connect(MASTER)
    const noiseEnd = t0 + 0.07
    noise.start(t0); noise.stop(noiseEnd)
    handles.push({ osc: noise, gain: ng, scheduledEnd: noiseEnd })

    if (ACTIVE_TRACKER) handles.forEach((h) => ACTIVE_TRACKER.push(h))
    return handles
  }, [])

  // Helper for the three tone-sequence playback methods. Sets up a
  // tracker so every scheduleTone() during `scheduleFn` is captured;
  // returns a cancel() that fades the tracked sources, clears timers,
  // and detaches the tracker.
  const startSession = useCallback((scheduleFn) => {
    if (ACTIVE_CANCEL) ACTIVE_CANCEL()
    const sources = []
    const timers = []
    let cancelled = false

    // Install tracker for the synchronous-ish duration of scheduling.
    // Async scheduleFns must opt back in by setting ACTIVE_TRACKER
    // themselves before/during their inner forEach (we expose it via
    // the second arg below).
    const trackerHook = {
      attach() { ACTIVE_TRACKER = sources },
      detach() { if (ACTIVE_TRACKER === sources) ACTIVE_TRACKER = null },
      sources,
      timers,
      isCancelled: () => cancelled,
    }

    const cancel = () => {
      cancelled = true
      timers.forEach(clearTimeout)
      timers.length = 0
      killAllSources(sources)
      trackerHook.detach()
    }
    ACTIVE_CANCEL = cancel
    cancelRef.current = cancel

    scheduleFn(trackerHook)
    return cancel
  }, [])

  const playFrequencies = useCallback((freqs, noteMs = 450, onNoteStart, onDone) => {
    startSession((session) => {
      ensureRunning().then((ctx) => {
        if (session.isCancelled()) return
        session.attach()
        try {
          const startCtxTime = ctx.currentTime + 0.06
          const noteSec = noteMs / 1000
          const sustain = Math.min(noteSec * 0.92, noteSec - 0.012)
          freqs.forEach((freq, i) => {
            if (!Number.isFinite(freq) || freq <= 0) return
            const at = startCtxTime + i * noteSec
            scheduleTone(at, freq, sustain, 'triangle', SWARA_VOL)
            const delayMs = (at - ctx.currentTime) * 1000
            session.timers.push(setTimeout(() => {
              if (!session.isCancelled() && onNoteStart) onNoteStart(freq, i)
            }, Math.max(0, delayMs)))
          })
          session.timers.push(setTimeout(() => {
            if (!session.isCancelled() && onDone) onDone()
          }, freqs.length * noteMs + 60))
        } finally {
          session.detach()
        }
      })
    })
  }, [scheduleTone, startSession])

  const playNotes = useCallback((notes, onNoteStart, onDone) => {
    startSession((session) => {
      ensureRunning().then((ctx) => {
        if (session.isCancelled()) return
        session.attach()
        try {
          const startCtxTime = ctx.currentTime + 0.06
          let cursorMs = 0
          notes.forEach((n, i) => {
            const at = startCtxTime + cursorMs / 1000
            const durSec = n.durMs / 1000
            const sustain = Math.max(0.02, Math.min(durSec * 0.94, durSec - 0.012))
            if (Number.isFinite(n.freq) && n.freq > 0) {
              scheduleTone(at, n.freq, sustain, 'triangle', SWARA_VOL)
            }
            const delayMs = (at - ctx.currentTime) * 1000
            session.timers.push(setTimeout(() => {
              if (!session.isCancelled() && onNoteStart) onNoteStart(n, i)
            }, Math.max(0, delayMs)))
            cursorMs += n.durMs
          })
          session.timers.push(setTimeout(() => {
            if (!session.isCancelled() && onDone) onDone()
          }, cursorMs + 60))
        } finally {
          session.detach()
        }
      })
    })
  }, [scheduleTone, startSession])

  const playSequence = useCallback((swaras, noteMs = 450, onNoteStart, onDone) => {
    startSession((session) => {
      ensureRunning().then((ctx) => {
        if (session.isCancelled()) return
        session.attach()
        try {
          const startCtxTime = ctx.currentTime + 0.06
          const noteSec = noteMs / 1000
          swaras.forEach((sw, i) => {
            const semi = SWARA_SEMITONE[sw] ?? 0
            const at = startCtxTime + i * noteSec
            scheduleTone(at, semitoneToFreq(semi), noteSec * 0.92, 'triangle', SWARA_VOL)
            const delayMs = (at - ctx.currentTime) * 1000
            session.timers.push(setTimeout(() => {
              if (!session.isCancelled() && onNoteStart) onNoteStart(sw, i)
            }, Math.max(0, delayMs)))
          })
          session.timers.push(setTimeout(() => {
            if (!session.isCancelled() && onDone) onDone()
          }, swaras.length * noteMs + 60))
        } finally {
          session.detach()
        }
      })
    })
  }, [scheduleTone, startSession])

  const stop = useCallback(() => {
    if (cancelRef.current) cancelRef.current()
    // Also clear any active session that didn't originate from THIS hook
    // instance (e.g. metronome's). Safety net so a globally-pressed Stop
    // really stops everything.
    if (ACTIVE_CANCEL) ACTIVE_CANCEL()
  }, [])

  useEffect(() => () => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  // Memoize the returned API so callers see a stable reference across
  // renders. Without this, useMetronome's `useEffect(() => () => stop(), [stop])`
  // cleanup fires on every render — because `stop` depends on `audio` and
  // `audio` was a fresh object each time — which would set isRunning(false)
  // immediately after start() set it true, so the metronome never ticked.
  return useMemo(() => ({
    ensureCtx,
    ensureRunning,
    getCtx: getOrCreateCtx,
    getMaster: () => MASTER,
    scheduleTone,
    scheduleClick,
    scheduleKattai,
    scheduleJalra,
    playSequence,
    playFrequencies,
    playNotes,
    stop,
  }), [ensureCtx, scheduleTone, scheduleClick, scheduleKattai, scheduleJalra, playSequence, playFrequencies, playNotes, stop])
}
