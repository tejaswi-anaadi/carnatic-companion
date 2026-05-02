// Carnatic 16 swara-sthanas mapped to 12-TET semitone offsets from Sa.
export const SWARA_SEMITONE = {
  S:  0,
  R1: 1, R2: 2, R3: 3,
  G1: 2, G2: 3, G3: 4,
  M1: 5, M2: 6,
  P:  7,
  D1: 8, D2: 9, D3: 10,
  N1: 9, N2: 10, N3: 11,
  "S'": 12,
}

export const SWARA_LABEL = {
  S: 'Sa', "S'": 'Sa',
  R1: 'Ri₁', R2: 'Ri₂', R3: 'Ri₃',
  G1: 'Ga₁', G2: 'Ga₂', G3: 'Ga₃',
  M1: 'Ma₁', M2: 'Ma₂',
  P: 'Pa',
  D1: 'Dha₁', D2: 'Dha₂', D3: 'Dha₃',
  N1: 'Ni₁', N2: 'Ni₂', N3: 'Ni₃',
}

// Returns a frequency (Hz) for a semitone offset above Sa.
// Sa is anchored at E3 (~164.81 Hz) — the warm lower-register that matches a
// veena/violin player's natural Sa, not Western middle-C.
export function semitoneToFreq(semi, baseFreq = 164.8138) {
  return baseFreq * Math.pow(2, semi / 12)
}
