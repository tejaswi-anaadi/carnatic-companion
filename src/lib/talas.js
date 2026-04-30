// Suladi Sapta Tala system — 7 families × 5 jathis = 35 talas.

export const JATHIS = [
  { name: 'Tisra',    beats: 3 },
  { name: 'Chatusra', beats: 4 },
  { name: 'Khanda',   beats: 5 },
  { name: 'Misra',    beats: 7 },
  { name: 'Sankirna', beats: 9 },
]

export const NADAIS = [
  { name: 'Tisra',    sub: 3 },
  { name: 'Chatusra', sub: 4 },
  { name: 'Khanda',   sub: 5 },
  { name: 'Misra',    sub: 7 },
  { name: 'Sankirna', sub: 9 },
]

// Anga types: I = Laghu (variable), O = Drutam (2 beats), U = Anudrutam (1 beat).
export const FAMILIES = [
  { name: 'Dhruva',  template: ['I', 'O', 'I', 'I'] },
  { name: 'Matya',   template: ['I', 'O', 'I'] },
  { name: 'Rupaka',  template: ['O', 'I'] },
  { name: 'Jhampa',  template: ['I', 'U', 'O'] },
  { name: 'Triputa', template: ['I', 'O', 'O'] },
  { name: 'Ata',     template: ['I', 'I', 'O', 'O'] },
  { name: 'Eka',     template: ['I'] },
]

// Build the action sequence for a single anga.
// Returns an array of {action, label}, one entry per beat.
function angaActions(type, jathiBeats) {
  if (type === 'U') return [{ action: 'clap', label: 'Clap' }]
  if (type === 'O') return [
    { action: 'clap', label: 'Clap' },
    { action: 'wave', label: 'Wave' },
  ]
  // Laghu: clap, then (jathi - 1) finger counts, pinky -> ring -> middle -> index -> thumb (then wraps)
  const out = [{ action: 'clap', label: 'Clap' }]
  for (let i = 1; i < jathiBeats; i++) {
    const fingerIdx = ((i - 1) % 5) + 1 // 1..5: pinky, ring, middle, index, thumb (then wraps)
    out.push({ action: `finger-${fingerIdx}`, label: `Finger ${i}` })
  }
  return out
}

export function buildTala(family, jathi) {
  const angas = family.template.map((type) => {
    const beats = type === 'I' ? jathi.beats : type === 'O' ? 2 : 1
    return {
      type,
      beats,
      actions: angaActions(type, jathi.beats),
    }
  })
  const totalBeats = angas.reduce((sum, a) => sum + a.beats, 0)
  return {
    id: `${family.name}-${jathi.name}`,
    family: family.name,
    template: family.template,
    jathi: jathi.name,
    jathiBeats: jathi.beats,
    angas,
    totalBeats,
  }
}

export const TALAS = FAMILIES.flatMap((f) =>
  JATHIS.map((j) => buildTala(f, j))
)

// Flatten a tala's beats into a per-beat sequence: [{angaIdx, beatInAnga, action, label}]
export function flattenTalaBeats(tala) {
  const seq = []
  tala.angas.forEach((anga, angaIdx) => {
    anga.actions.forEach((act, beatInAnga) => {
      seq.push({ angaIdx, beatInAnga, ...act })
    })
  })
  return seq
}
