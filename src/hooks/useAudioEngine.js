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
    playSequence,
    playFrequencies,
    playNotes,
    stop,
  }), [ensureCtx, scheduleTone, scheduleClick, playSequence, playFrequencies, playNotes, stop])
}
