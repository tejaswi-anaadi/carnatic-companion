// Carnatic shrutis ("kattai" / pitch references).
//
// Shruti = the base pitch at which "Sa" is sung or played. Different
// vocalists/instrumentalists pick a shruti based on voice or instrument
// range. The kattai system labels semitone-spaced pitches numerically;
// half-positions (1½, 2½, …) sit between whole numbers.
//
// Conventional ranges:
//   1–3 kattai (C–E): typical male voices
//   4–6 kattai (F♯–A♯): typical female voices
//
// Hz values are equal-temperament, anchored at A4 = 440 Hz.

export const SHRUTIS = [
  { id: '1',   kattai: '1',  note: 'C',  hz: 261.63, voice: 'male'   },
  { id: '1.5', kattai: '1½', note: 'C♯', hz: 277.18, voice: 'male'   },
  { id: '2',   kattai: '2',  note: 'D',  hz: 293.66, voice: 'male'   },
  { id: '2.5', kattai: '2½', note: 'D♯', hz: 311.13, voice: 'male'   },
  { id: '3',   kattai: '3',  note: 'E',  hz: 329.63, voice: 'male'   },
  { id: '3.5', kattai: '3½', note: 'F',  hz: 349.23, voice: 'mid'    },
  { id: '4',   kattai: '4',  note: 'F♯', hz: 369.99, voice: 'female' },
  { id: '4.5', kattai: '4½', note: 'G',  hz: 392.00, voice: 'female' },
  { id: '5',   kattai: '5',  note: 'G♯', hz: 415.30, voice: 'female' },
  { id: '5.5', kattai: '5½', note: 'A',  hz: 440.00, voice: 'female' },
  { id: '6',   kattai: '6',  note: 'A♯', hz: 466.16, voice: 'female' },
  { id: '6.5', kattai: '6½', note: 'B',  hz: 493.88, voice: 'female' },
]

// Default to 1 kattai (C) — matches the legacy semitoneToFreq baseline.
export const DEFAULT_SHRUTI_ID = '1'

export function findShruti(id) {
  return SHRUTIS.find((s) => s.id === id) ?? SHRUTIS[0]
}
