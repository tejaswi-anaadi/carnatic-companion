// Sarali / Janta / Dhatu / Alankaram patterns expressed as RELATIVE indices
// over an 8-position scale slot:
//   0 = S, 1 = R, 2 = G, 3 = M, 4 = P, 5 = D, 6 = N, 7 = Ṡ
//
// `null` means kaarvai — sustain the previous sounded note across this slot.
// Each line is exactly 8 aksharas (Adi tala). A pattern is a list of lines
// (typically 2–20), played top-to-bottom.
//
// Indices outside [0,7] are honoured: index `i` means note (i mod 8) of the
// raga's arohanam, shifted by floor(i/8) octaves. This lets later varisais
// dip into mandara stayi (negative) or climb past tara Sa (>= 8).
//
// Source: Purandaradasa's traditional varisais, transcribed against
// Mayamalavagowla per shivkumar.org / Chitraveena Ravikiran's notes.

import { JANTA_PATTERNS } from './varisai-janta.js'
import { DHATU_PATTERNS } from './varisai-dhatu.js'
import { ALANKARAM_PATTERNS } from './varisai-alankaram.js'

export const SARALI_PATTERNS = [
  {
    id: 1,
    title: 'Simple ascent / descent',
    laya: '1234 5678',
    lines: [
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 2,
    title: 'Focus on R and N',
    laya: '12 12 1234',
    lines: [
      [0,1, 0,1, 0,1, 2,3],
      [0,1,2,3, 4,5, 6,7],
      [7,6, 7,6, 7,6, 5,4],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 3,
    title: 'Focus on G and D',
    laya: '123 123 12',
    lines: [
      [0,1,2, 0,1,2, 0,1],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5, 7,6,5, 7,6],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 4,
    title: 'Focus on M and P',
    laya: '1234 1234',
    lines: [
      [0,1,2,3, 0,1, 2,3],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 7,6, 5,4],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 5,
    title: 'Focus on P, M (dheergam); R, N',
    laya: '1234 56 12',
    lines: [
      [0,1,2,3, 4,null, 0,1],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,null, 7,6],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 6,
    title: 'Focus on G and D (extended)',
    laya: '1234 56 12',
    lines: [
      [0,1,2,3, 4,5, 0,1],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,2, 7,6],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 7,
    title: 'Focus on N and R (dheergam)',
    laya: '1234 56 7,',
    lines: [
      [0,1,2,3, 4,5, 6,null],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,2, 1,null],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 8,
    title: 'Zigzag — pmgr & mpdn',
    laya: '1234 4321',
    lines: [
      [0,1,2,3, 4,3, 2,1],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,4, 5,6],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 9,
    title: 'Zigzag — pmdp & mpgm',
    laya: '1234 4321',
    lines: [
      [0,1,2,3, 4,3, 5,4],
      [0,1,2,3, 4,5, 6,7],
      [7,6,5,4, 3,4, 2,3],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 10,
    title: 'Dheergam on P; G as nyaasa swaram',
    laya: 'mixed',
    lines: [
      [0,1,2,3, 4,null, 2,3],
      [4,null,null,null, 4,null, null,null],
      [2,3,4,5, 6,5, 4,3],
      [2,3,4,2, 3,2, 1,0],
    ],
  },
  {
    id: 11,
    title: 'Dheergams at S, N, D, P',
    laya: 'mixed',
    lines: [
      [7,null,6,5, 6,null, 5,4],
      [5,null,4,3, 4,null, 4,null],
      [2,3,4,5, 6,5, 4,3],
      [2,3,4,2, 3,2, 1,0],
    ],
  },
  {
    id: 12,
    title: 'Janta preview — SS, nn, dd, pp',
    laya: 'mixed',
    lines: [
      [7,7,6,5, 6,6, 5,4],
      [5,5,4,3, 4,null, 4,null],
      [2,3,4,5, 6,5, 4,3],
      [2,3,4,2, 3,2, 1,0],
    ],
  },
  {
    id: 13,
    title: 'Zigzag — srgrG, gmpmP; dheergam G, P, D',
    laya: 'mixed',
    lines: [
      [0,1,2,1, 2,null, 2,3],
      [4,3,4,null, 5,4, 5,null],
      [3,4,5,4, 5,6, 5,4],
      [3,4,5,4, 3,2, 1,0],
    ],
  },
  {
    id: 14,
    title: 'Dheergam at P, S; janta on D, M',
    laya: 'mixed',
    lines: [
      [0,1,2,3, 4,null, 4,null],
      [5,5,4,null, 3,3, 4,null],
      [5,6,7,null, 7,6, 5,4],
      [7,6,5,4, 3,2, 1,0],
    ],
  },
]

// Re-export so view code can import everything from one module.
export { JANTA_PATTERNS, DHATU_PATTERNS, ALANKARAM_PATTERNS }

// Bar lines for the on-screen notation reflect the tala's anga structure.
// Adi tala (sarali / janta / dhatu) → 4-akshara laghu + 2 dhrutams of 2.
// Each alankaram pattern carries its own barPositions, so this default
// only applies to the other three categories.
export const DEFAULT_BAR_POSITIONS = [4, 6]

export const VARISAI_CATEGORIES = [
  { id: 'sarali',    label: 'Sarali Varisai',    singular: 'Sarali Varisai', enabled: true,  patterns: SARALI_PATTERNS },
  { id: 'janta',     label: 'Janta Varisai',     singular: 'Janta Varisai',  enabled: true,  patterns: JANTA_PATTERNS },
  { id: 'dhatu',     label: 'Dhatu Varisai',     singular: 'Dhatu Varisai',  enabled: true,  patterns: DHATU_PATTERNS },
  { id: 'alankaram', label: 'Alankaram',         singular: 'Alankaram',      enabled: true,  patterns: ALANKARAM_PATTERNS },
]

export function getCategory(id) {
  return VARISAI_CATEGORIES.find((c) => c.id === id) ?? VARISAI_CATEGORIES[0]
}

// Compact single-letter labels used for Varisai notation display.
export const RELATIVE_NOTE_LABELS = ['S', 'R', 'G', 'M', 'P', 'D', 'N', 'Ṡ']

// Returns { label, octaveShift } for any (possibly out-of-range) index.
export function relativeNoteFor(idx) {
  const oct = Math.floor(idx / 8)
  const pos = ((idx % 8) + 8) % 8
  return { label: RELATIVE_NOTE_LABELS[pos], octaveShift: oct, pos }
}

// Tempo math.
//   1st speed: 1 note per beat
//   2nd speed: 2 notes per beat
//   3rd speed: 4 notes per beat
export const SPEEDS = [
  { id: 1, label: '1st Speed', notesPerBeat: 1 },
  { id: 2, label: '2nd Speed', notesPerBeat: 2 },
  { id: 3, label: '3rd Speed', notesPerBeat: 4 },
]

export function noteMsForSpeed(bpm, speedId) {
  const s = SPEEDS.find((x) => x.id === speedId) ?? SPEEDS[0]
  const beatMs = 60_000 / bpm
  return beatMs / s.notesPerBeat
}

// Walk a flat indices array, collapsing each non-null index plus its
// trailing nulls (kaarvai) into a single sounded "note" of duration
// (1 + nullCount) * slotMs. Returns:
//   notes:        [{ freq, durMs, firstCell }] — what to schedule
//   cellToGroup:  number[] — for each cell index in `indices`, which
//                 sounded-note group it belongs to (-1 if a leading
//                 null with no prior note, which shouldn't occur).
export function buildSchedule(indices, freqAt, slotMs) {
  const notes = []
  const cellToGroup = []
  let current = null
  indices.forEach((idx, cellIdx) => {
    if (idx == null) {
      if (current) {
        current.durMs += slotMs
        cellToGroup.push(current.gIdx)
      } else {
        cellToGroup.push(-1)
      }
      return
    }
    const freq = freqAt(idx)
    const gIdx = notes.length
    const note = { gIdx, freq, durMs: slotMs, firstCell: cellIdx }
    notes.push(note)
    current = note
    cellToGroup.push(gIdx)
  })
  return { notes, cellToGroup }
}
