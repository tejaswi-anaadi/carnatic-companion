import { useCallback, useEffect, useRef, useState } from 'react'
import { flattenTalaBeats } from '../lib/talas.js'

// Lookahead-scheduled metronome driver.
// Emits {beatIdx, subIdx} on each main beat / sub-click via React state.
//
// Inputs:
//   audio: useAudioEngine() return value
//   tala: a tala object (or null when stopped)
//   nadai: subdivisions per beat (3,4,5,7,9)
//   bpm: main beats per minute
// `voice` selects the tala-stroke timbre:
//   'beep'   — original square/sine click-tone (default for back-compat)
//   'kattai' — wooden block (Bharatanatyam clappers): main = loud/strong,
//              other beats inside the anga = lower & softer, sub-pulses silent
//   'jalra'  — small hand cymbals: bell-like sustain, same role hierarchy
export function useMetronome({ audio, tala, nadai, bpm, voice = 'beep' }) {
  const [isRunning, setIsRunning] = useState(false)
  const [pos, setPos] = useState({ beatIdx: 0, subIdx: 0 })

  const beatsRef = useRef([])
  const nextNoteTimeRef = useRef(0)
  const counterRef = useRef({ beatIdx: 0, subIdx: 0 })
  const intervalRef = useRef(null)
  const totalBeatsRef = useRef(0)
  // Track scheduled-but-not-yet-played clicks so stop() can yank them.
  // Without this, clicks already scheduled within the 100ms lookahead
  // window keep firing after the user hits Stop.
  const sourcesRef = useRef([])
  const visualTimersRef = useRef([])

  const killSource = ({ osc, gain, scheduledEnd }) => {
    if (!osc) return
    const ctx = audio.getCtx()
    const now = ctx.currentTime
    if (scheduledEnd != null && scheduledEnd <= now) return
    try {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.01)
      osc.stop(now + 0.015)
    } catch (_e) { /* already stopped */ }
  }

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Kill any clicks already on the audio timeline.
    sourcesRef.current.forEach(killSource)
    sourcesRef.current = []
    // Cancel pending visual updates so the cursor freezes immediately.
    visualTimersRef.current.forEach(clearTimeout)
    visualTimersRef.current = []
    setPos({ beatIdx: 0, subIdx: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio])

  const start = useCallback(async () => {
    if (!tala) return
    // Wait for the context to actually be in 'running' state before we
    // capture currentTime as our nextNoteTime baseline. Otherwise on a
    // suspended context the tick loop schedules everything in the past
    // and nothing sounds.
    const ctx = await audio.ensureRunning()
    const beats = flattenTalaBeats(tala)
    beatsRef.current = beats
    totalBeatsRef.current = beats.length
    counterRef.current = { beatIdx: 0, subIdx: 0 }
    setPos({ beatIdx: 0, subIdx: 0 })
    nextNoteTimeRef.current = ctx.currentTime + 0.08
    setIsRunning(true)
  }, [tala, audio])

  // Scheduling loop: every 25ms, schedule any clicks within the next 100ms.
  useEffect(() => {
    if (!isRunning) return
    const lookahead = 0.1
    const ctx = audio.getCtx()

    const tick = () => {
      // If the context drifts back to suspended (tab inactive, OS audio
      // session interruption, etc.), bail this tick and try to resume.
      // Without this, the loop keeps trying to schedule events on a
      // dead context and the user hears silence with no obvious cause.
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {})
        nextNoteTimeRef.current = ctx.currentTime + 0.08
        return
      }
      const sec = ctx.currentTime
      const subSec = 60 / bpm / nadai
      // Prune already-finished click handles so the array stays small
      // during long sessions.
      sourcesRef.current = sourcesRef.current.filter((h) => h && h.scheduledEnd > sec)
      // If we've fallen behind (e.g. main thread was blocked), skip
      // forward instead of dumping a flurry of stale events.
      if (nextNoteTimeRef.current < sec - 0.5) {
        nextNoteTimeRef.current = sec + 0.05
      }
      while (nextNoteTimeRef.current < sec + lookahead) {
        const { beatIdx, subIdx } = counterRef.current
        const beat = beatsRef.current[beatIdx]
        // 'clap' is the start-of-anga stroke (samam at beat 0, plus the
        // start of every later anga); everything else inside an anga
        // (wave / finger-N) is a softer "sub-main" stroke; everything
        // between beats is a quiet "sub" tick.
        const role =
          subIdx === 0 ? (beat.action === 'clap' ? 'main' : 'sub-main') : 'sub'
        if (voice === 'kattai') {
          sourcesRef.current.push(...audio.scheduleKattai(nextNoteTimeRef.current, role))
        } else if (voice === 'jalra') {
          sourcesRef.current.push(...audio.scheduleJalra(nextNoteTimeRef.current, role))
        } else {
          const handle = subIdx === 0
            ? audio.scheduleClick(nextNoteTimeRef.current, beat.action)
            : audio.scheduleClick(nextNoteTimeRef.current, 'sub')
          if (handle) sourcesRef.current.push(handle)
        }
        // Update visible state — slightly delayed to align with audio.
        const visualDelay = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
        const snapshot = { beatIdx, subIdx }
        const t = setTimeout(() => setPos(snapshot), visualDelay)
        visualTimersRef.current.push(t)

        // Advance counter
        let nSub = subIdx + 1
        let nBeat = beatIdx
        if (nSub >= nadai) {
          nSub = 0
          nBeat = (beatIdx + 1) % totalBeatsRef.current
        }
        counterRef.current = { beatIdx: nBeat, subIdx: nSub }
        nextNoteTimeRef.current += subSec
      }
    }

    intervalRef.current = setInterval(tick, 25)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning, audio, bpm, nadai, voice])

  // If tala/nadai/bpm change while running, restart cleanly.
  useEffect(() => {
    if (!isRunning) return
    audio.ensureRunning().then((ctx) => {
      counterRef.current = { beatIdx: 0, subIdx: 0 }
      nextNoteTimeRef.current = ctx.currentTime + 0.08
      setPos({ beatIdx: 0, subIdx: 0 })
    })
  }, [tala?.id, nadai, bpm]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stop(), [stop])

  return { isRunning, pos, start, stop }
}
