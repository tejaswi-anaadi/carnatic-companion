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
export function useMetronome({ audio, tala, nadai, bpm }) {
  const [isRunning, setIsRunning] = useState(false)
  const [pos, setPos] = useState({ beatIdx: 0, subIdx: 0 })

  const beatsRef = useRef([])
  const nextNoteTimeRef = useRef(0)
  const counterRef = useRef({ beatIdx: 0, subIdx: 0 })
  const intervalRef = useRef(null)
  const totalBeatsRef = useRef(0)

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPos({ beatIdx: 0, subIdx: 0 })
  }, [])

  const start = useCallback(() => {
    if (!tala) return
    audio.ensureCtx()
    const beats = flattenTalaBeats(tala)
    beatsRef.current = beats
    totalBeatsRef.current = beats.length
    counterRef.current = { beatIdx: 0, subIdx: 0 }
    setPos({ beatIdx: 0, subIdx: 0 })
    nextNoteTimeRef.current = audio.getCtx().currentTime + 0.06
    setIsRunning(true)
  }, [tala, audio])

  // Scheduling loop: every 25ms, schedule any clicks within the next 100ms.
  useEffect(() => {
    if (!isRunning) return
    const lookahead = 0.1
    const ctx = audio.getCtx()

    const tick = () => {
      const sec = ctx.currentTime
      const subSec = 60 / bpm / nadai
      while (nextNoteTimeRef.current < sec + lookahead) {
        const { beatIdx, subIdx } = counterRef.current
        const beat = beatsRef.current[beatIdx]
        if (subIdx === 0) {
          // Main beat: action sound.
          audio.scheduleClick(nextNoteTimeRef.current, beat.action)
        } else {
          audio.scheduleClick(nextNoteTimeRef.current, 'sub')
        }
        // Update visible state — slightly delayed to align with audio.
        const visualDelay = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
        const snapshot = { beatIdx, subIdx }
        setTimeout(() => setPos(snapshot), visualDelay)

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
  }, [isRunning, audio, bpm, nadai])

  // If tala/nadai/bpm change while running, restart cleanly.
  useEffect(() => {
    if (!isRunning) return
    counterRef.current = { beatIdx: 0, subIdx: 0 }
    nextNoteTimeRef.current = audio.getCtx().currentTime + 0.06
    setPos({ beatIdx: 0, subIdx: 0 })
  }, [tala?.id, nadai, bpm]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stop(), [stop])

  return { isRunning, pos, start, stop }
}
