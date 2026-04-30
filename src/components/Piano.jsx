import { SWARA_LABEL, SWARA_SEMITONE } from '../lib/swaras.js'

// 13-key piano (S to S'), with white/black layout. Each key labelled with
// the Carnatic swarasthana(s) at that semitone — so a learner can see at a
// glance that semitone 2 is "R2 / G1", semitone 9 is "D2 / N1", etc.
//
// Multiple swarasthanas can share a semitone (the enharmonic vivadi pairs):
//   semi 2  -> R2, G1     semi 3  -> R3, G2
//   semi 9  -> D2, N1     semi 10 -> D3, N2
// We render those as a stacked label so both names are visible.
const KEYS = [
  { semi: 0,  type: 'white', labels: ['S'] },
  { semi: 1,  type: 'black', labels: ['R1'] },
  { semi: 2,  type: 'white', labels: ['R2', 'G1'] },
  { semi: 3,  type: 'black', labels: ['R3', 'G2'] },
  { semi: 4,  type: 'white', labels: ['G3'] },
  { semi: 5,  type: 'white', labels: ['M1'] },
  { semi: 6,  type: 'black', labels: ['M2'] },
  { semi: 7,  type: 'white', labels: ['P'] },
  { semi: 8,  type: 'black', labels: ['D1'] },
  { semi: 9,  type: 'white', labels: ['D2', 'N1'] },
  { semi: 10, type: 'black', labels: ['D3', 'N2'] },
  { semi: 11, type: 'white', labels: ['N3'] },
  { semi: 12, type: 'white', labels: ["S'"] },
]

// Render a swarasthana name with subscript using Unicode subscripts so it
// looks the same in any font. (The SWARA_LABEL helper does this for the
// active-swara display below; here we render directly.)
function fmtName(name) {
  // Map "R1" → "R₁", "D2" → "D₂", etc. Sa and Pa are bare.
  if (name === 'S' || name === 'P') return name
  if (name === "S'") return 'Ṡ'
  const sub = { 1: '₁', 2: '₂', 3: '₃' }
  const head = name[0]
  const tail = sub[name[1]] ?? name.slice(1)
  return head + tail
}

export default function Piano({ activeSwara, ragaSwaras = [] }) {
  const activeSemi = activeSwara != null ? SWARA_SEMITONE[activeSwara] : null

  // Semitones used by the raga arohanam (set, for "in-raga" key shading).
  const ragaSemis = new Set(ragaSwaras.map((s) => SWARA_SEMITONE[s]))

  const whites = KEYS.filter((k) => k.type === 'white')
  const blacks = KEYS.filter((k) => k.type === 'black')

  return (
    <div className="relative inline-block select-none w-full max-w-md mx-auto">
      <div className="relative h-36 sm:h-40 flex">
        {whites.map((k) => {
          const isActive = activeSemi === k.semi
          const inRaga = ragaSemis.has(k.semi)
          return (
            <div
              key={k.semi}
              className={
                'flex-1 mx-[1px] rounded-b-md border border-ink/30 flex flex-col items-center justify-end pb-2 gap-0 text-[10px] font-medium transition-all duration-150 ' +
                (isActive
                  ? 'bg-gradient-to-b from-gold-light to-gold shadow-glow scale-y-[1.02] text-crimson-dark'
                  : inRaga
                    ? 'bg-cream-dark text-ink/85'
                    : 'bg-cream text-ink/45')
              }
            >
              {k.labels.map((nm) => (
                <span key={nm} className="font-display leading-tight tabular-nums">
                  {fmtName(nm)}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      {/* Black keys layered on top */}
      <div className="absolute inset-0 pointer-events-none">
        {blacks.map((k) => {
          const isActive = activeSemi === k.semi
          const inRaga = ragaSemis.has(k.semi)
          const POS = { 1: 0.5/8, 3: 1.5/8, 6: 3.5/8, 8: 4.5/8, 10: 5.5/8 }
          const left = POS[k.semi] * 100
          const isStacked = k.labels.length > 1
          return (
            <div
              key={k.semi}
              style={{ left: `${left}%`, width: 'calc(100%/8 * 0.55)' }}
              className={
                'absolute top-0 h-[68%] rounded-b-md border border-ink/60 flex flex-col items-center justify-end pb-1.5 transition-all duration-150 ' +
                (isActive
                  ? 'bg-gradient-to-b from-saffron to-crimson shadow-glow text-cream'
                  : inRaga
                    ? 'bg-ink/90 text-cream/95'
                    : 'bg-ink/70 text-cream/55')
              }
            >
              {k.labels.map((nm) => (
                <span
                  key={nm}
                  className={'font-display leading-none tabular-nums ' + (isStacked ? 'text-[8px]' : 'text-[9px]')}
                >
                  {fmtName(nm)}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="text-center mt-3 h-5 text-sm text-crimson font-display tracking-wide">
        {activeSwara && <span>{SWARA_LABEL[activeSwara] ?? activeSwara}</span>}
      </div>
    </div>
  )
}
