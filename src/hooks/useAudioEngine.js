import { useCallback, useEffect, useRef } from 'react'
import { SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'

// Lazy-init AudioContext on first user interaction.
export function useAudioEngine() {
  const ctxRef = useRef(null)
  const masterGainRef = useRef(null)
  const cancelRef = useRef(null)

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = 0.6
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterGainRef.current = master
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  // Schedule a tone at audio time `at` (seconds, ctx.currentTime).
  const scheduleTone = useCallback((at, freq, durSec, type = 'triangle', vol = 0.3) => {
    const ctx = ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    const attack = 0.01
    const release = Math.min(0.08, durSec * 0.4)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(vol, at + attack)
    gain.gain.setValueAtTime(vol, at + Math.max(attack, durSec - release))
    gain.gain.linearRampToValueAtTime(0.0001, at + durSec)
    osc.connect(gain)
    gain.connect(masterGainRef.current)
    osc.start(at)
    osc.stop(at + durSec + 0.05)
  }, [ensureCtx])

  // Click sound for metronome — short noise burst, filtered for tone color.
  const scheduleClick = useCallback((at, kind = 'clap') => {
    const ctx = ensureCtx()
    // Use an oscillator + envelope for a clean tick (cheaper than noise buffer).
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'

    let freq, q, vol, dur
    switch (kind) {
      case 'clap':
        osc.type = 'square'; freq = 1400; q = 4; vol = 0.45; dur = 0.06; break
      case 'wave':
        osc.type = 'sine'; freq = 520; q = 2; vol = 0.32; dur = 0.10; break
      case 'finger-1':
      case 'finger-2':
      case 'finger-3':
      case 'finger-4':
        osc.type = 'triangle'
        freq = 700 + (parseInt(kind.split('-')[1]) - 1) * 80
        q = 3; vol = 0.22; dur = 0.05; break
      case 'sub':
      default:
        osc.type = 'sine'; freq = 2200; q = 8; vol = 0.12; dur = 0.02; break
    }

    osc.frequency.setValueAtTime(freq, at)
    filter.frequency.setValueAtTime(freq, at)
    filter.Q.value = q
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(vol, at + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGainRef.current)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }, [ensureCtx])

  // Play a sequence of swaras, calling onNoteStart(swara, idx) at the start of each.
  const playSequence = useCallback((swaras, noteMs = 450, onNoteStart, onDone) => {
    const ctx = ensureCtx()
    // Cancel any existing sequence.
    if (cancelRef.current) cancelRef.current()
    let cancelled = false
    const timers = []
    cancelRef.current = () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }

    const startCtxTime = ctx.currentTime + 0.05
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
  }, [ensureCtx, scheduleTone])

  const stop = useCallback(() => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  useEffect(() => () => {
    if (cancelRef.current) cancelRef.current()
  }, [])

  return {
    ensureCtx,
    getCtx: () => ctxRef.current,
    getMaster: () => masterGainRef.current,
    scheduleTone,
    scheduleClick,
    playSequence,
    stop,
  }
}
