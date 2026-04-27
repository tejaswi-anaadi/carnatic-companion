import { useCallback, useEffect, useRef } from 'react'
import { SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'

// ---------------------------------------------------------------------------
// Module-scoped singleton AudioContext.
//
// Why a singleton: every component that calls useAudioEngine() used to spin
// up its own AudioContext. After a few tab switches (Ragas -> Talas ->
// Ragas) browsers run out of allowed contexts, and previously-created ones
// can drift into the 'suspended' / 'interrupted' states with no obvious
// recovery path — which is exactly the "sound just stops working, refresh
// doesn't help" symptom the user reported. (Refresh fixes it for *that*
// frame, but on slow connects the AC is created mid-interaction and ends
// up suspended again.)
//
// We now share ONE context across the whole app, eagerly resume it on every
// playback call, clamp scheduled events to never land in the past, and
// listen for visibilitychange to nudge the context back to running when
// the tab returns to the foreground.
// ---------------------------------------------------------------------------

let CTX = null
let MASTER = null
let ACTIVE_CANCEL = null

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

// Returns a Promise that resolves once the context is in 'running' state.
// Safe to call from any user gesture; safe to call repeatedly.
async function ensureRunning() {
  const ctx = getOrCreateCtx()
  if (ctx.state !== 'running') {
    try {
      await ctx.resume()
    } catch (e) {
      console.warn('[audio] resume() failed:', e?.message ?? e)
    }
  }
  return ctx
}

// Wake the context up when the tab returns to foreground or the page
// regains focus. This handles the common "switched tabs, came back, no
// sound" failure mode.
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

// Clamp a scheduled audio time so it's always at least a hair in the
// future. Web Audio silently drops events scheduled in the past, which
// is the other half of the "no sound" bug — if the context paused while
// the user was idle, currentTime advanced but our nextNoteTime ref did
// not, so all subsequent scheduled events fell behind.
function safeAt(ctx, at) {
  return Math.max(at, ctx.currentTime + 0.005)
}

export function useAudioEngine() {
  const cancelRef = useRef(null)

  const ensureCtx = useCallback(() => {
    // Fire-and-forget resume; return the (possibly still-resuming) ctx
    // so synchronous callers can read currentTime, etc. Async callers
    // should use ensureRunning directly.
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
    osc.start(t0)
    osc.stop(t0 + durSec + 0.05)
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
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }, [])

  const playSequence = useCallback((swaras, noteMs = 450, onNoteStart, onDone) => {
    // Cancel any existing sequence in flight (across components — the
    // singleton CANCEL means hitting Play in Talas while a raga is
    // playing also stops the raga, which is the right behaviour).
    if (ACTIVE_CANCEL) ACTIVE_CANCEL()
    let cancelled = false
    const timers = []
    const cancel = () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    ACTIVE_CANCEL = cancel
    cancelRef.current = cancel

    // Resume first, then schedule against the *post-resume* currentTime.
    // Awaiting here is essential: if the context was suspended, the old
    // code scheduled everything against a stale time, so the entire
    // sequence landed in the past and never sounded.
    ensureRunning().then((ctx) => {
      if (cancelled) return
      const startCtxTime = ctx.currentTime + 0.06
      const noteSec = noteMs / 1000
      swaras.forEach((sw, i) => {
        const semi = SWARA_SEMITONE[sw] ?? 0
        const at = startCtxTime + i * noteSec
        scheduleTone(at, semitoneToFreq(semi), noteSec * 0.92, 'triangle', 0.32)
        const delayMs = (at - ctx.currentTime) * 1000
        timers.push(setTimeout(() => {
          if (!cancelled && onNoteStart) onNoteStart(sw, i)
        }, Math.max(0, delayMs)))
      })
      timers.push(setTimeout(() => {
        if (!cancelled && onDone) onDone()
      }, swaras.length * noteMs + 60))
    })
  }, [scheduleTone])

  const stop = useCallback(() => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  useEffect(() => () => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  return {
    ensureCtx,
    ensureRunning,
    getCtx: getOrCreateCtx,
    getMaster: () => MASTER,
    scheduleTone,
    scheduleClick,
    playSequence,
    stop,
  }
}
