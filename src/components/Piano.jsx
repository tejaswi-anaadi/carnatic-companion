import { SWARA_LABEL, SWARA_SEMITONE } from '../lib/swaras.js'

// 13-key piano (S to S'), with white/black layout. Highlights active semitone.
const KEYS = [
  { semi: 0,  type: 'white', label: 'S'  },
  { semi: 1,  type: 'black' },
  { semi: 2,  type: 'white' },
  { semi: 3,  type: 'black' },
  { semi: 4,  type: 'white' },
  { semi: 5,  type: 'white', label: 'M' },
  { semi: 6,  type: 'black' },
  { semi: 7,  type: 'white', label: 'P' },
  { semi: 8,  type: 'black' },
  { semi: 9,  type: 'white' },
  { semi: 10, type: 'black' },
  { semi: 11, type: 'white' },
  { semi: 12, type: 'white', label: "S'" },
]

export default function Piano({ activeSwara, ragaSwaras = [] }) {
  const activeSemi = activeSwara != null ? SWARA_SEMITONE[activeSwara] : null

  // Semitones used by the raga arohanam (set, for "in-raga" key shading).
  const ragaSemis = new Set(ragaSwaras.map((s) => SWARA_SEMITONE[s]))

  const whites = KEYS.filter((k) => k.type === 'white')
  const blacks = KEYS.filter((k) => k.type === 'black')

  return (
    <div className="relative inline-block select-none w-full max-w-md mx-auto">
      <div className="relative h-32 sm:h-36 flex">
        {whites.map((k, i) => {
          const isActive = activeSemi === k.semi
          const inRaga = ragaSemis.has(k.semi)
          return (
            <div
              key={k.semi}
              className={
                'flex-1 mx-[1px] rounded-b-md border border-ink/30 flex items-end justify-center pb-2 text-[10px] font-medium transition-all duration-150 ' +
                (isActive
                  ? 'bg-gradient-to-b from-gold-light to-gold shadow-glow scale-y-[1.02] text-crimson-dark'
                  : inRaga
                    ? 'bg-cream-dark text-ink/80'
                    : 'bg-cream text-ink/40')
              }
            >
              {k.label && <span className="font-display">{k.label}</span>}
            </div>
          )
        })}
      </div>

      {/* Black keys layered on top */}
      <div className="absolute inset-0 pointer-events-none">
        {blacks.map((k) => {
          const isActive = activeSemi === k.semi
          const inRaga = ragaSemis.has(k.semi)
          // Position black keys based on white-key index just below them.
          // Each white key takes 1/8 of width (we have 8 whites). Black sits between.
          // Map semi -> left%
          const POS = { 1: 0.5/8, 3: 1.5/8, 6: 3.5/8, 8: 4.5/8, 10: 5.5/8 }
          const left = POS[k.semi] * 100
          return (
            <div
              key={k.semi}
              style={{ left: `${left}%`, width: 'calc(100%/8 * 0.55)' }}
              className={
                'absolute top-0 h-2/3 rounded-b-md border border-ink/60 transition-all duration-150 ' +
                (isActive
                  ? 'bg-gradient-to-b from-saffron to-crimson shadow-glow'
                  : inRaga
                    ? 'bg-ink/85'
                    : 'bg-ink/65')
              }
            />
          )
        })}
      </div>

      <div className="text-center mt-3 h-5 text-sm text-crimson font-display tracking-wide">
        {activeSwara && <span>{SWARA_LABEL[activeSwara] ?? activeSwara}</span>}
      </div>
    </div>
  )
}
