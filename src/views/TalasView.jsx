import { useMemo, useState } from 'react'
import { Play, Square } from 'lucide-react'
import TalaSelector from '../components/TalaSelector.jsx'
import TalaVisualizer from '../components/TalaVisualizer.jsx'
import { FAMILIES, JATHIS, NADAIS, buildTala } from '../lib/talas.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import { useMetronome } from '../hooks/useMetronome.js'
import { useT } from '../lib/i18n.jsx'

const VOICE_OPTIONS = [
  { id: 'kattai', label: 'Kattai',  hint: 'wooden block' },
  { id: 'jalra',  label: 'Jalra',   hint: 'hand cymbals' },
  { id: 'beep',   label: 'Click',   hint: 'electronic'   },
]

export default function TalasView() {
  const [family, setFamily] = useState(FAMILIES[4]) // Triputa
  const [jathi, setJathi] = useState(JATHIS[1])     // Chatusra
  const [nadai, setNadai] = useState(NADAIS[1])     // Chatusra
  const [bpm, setBpm] = useState(72)
  const [voice, setVoice] = useState('kattai')

  const tala = useMemo(() => buildTala(family, jathi), [family, jathi])
  const audio = useAudioEngine()
  const { isRunning, pos, start, stop } = useMetronome({ audio, tala, nadai: nadai.sub, bpm, voice })
  const t = useT()
  const isSa = t.lang === 'sa'

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          Sapta Talas
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Seven families, five jathis, five nadais — see and hear how each tala unfolds in claps, waves, and finger counts.
        </p>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 paper">
          <TalaSelector
            family={family} onFamilyChange={setFamily}
            jathi={jathi} onJathiChange={setJathi}
            nadai={nadai} onNadaiChange={setNadai}
            bpm={bpm} onBpmChange={setBpm}
          />
        </div>

        <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 paper space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl text-crimson font-semibold">
                {tala.family} · {tala.jathi} jathi
              </h3>
              <div className="text-xs text-ink/60 font-mono mt-0.5">
                Template: {tala.template.join(' ')} · Beats: {tala.angas.map((a) => a.beats).join(' + ')} = {tala.totalBeats}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-saffron">Sound</span>
                <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
                  {VOICE_OPTIONS.map((v) => {
                    const active = v.id === voice
                    return (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        title={v.hint}
                        className={
                          'px-3 py-1.5 text-xs font-semibold transition ' +
                          (active ? 'bg-crimson text-cream' : 'text-crimson hover:bg-gold/30')
                        }
                      >
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => (isRunning ? stop() : start())}
                className={
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ' +
                  (isRunning
                    ? 'bg-crimson text-cream shadow-temple'
                    : 'bg-gold text-crimson-dark hover:bg-saffron hover:text-cream shadow-temple')
                }
              >
                {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Stop Tala' : 'Start Tala'}
              </button>
            </div>
          </div>

          <TalaVisualizer tala={tala} pos={pos} isRunning={isRunning} nadai={nadai} />

          <div className="text-[11px] text-ink/55 italic border-t border-gold/30 pt-3">
            <strong className="not-italic text-crimson">Legend for {tala.family} · {tala.jathi}:</strong>{' '}
            {(() => {
              const hasLaghu = tala.template.includes('I')
              const hasDrutam = tala.template.includes('O')
              const hasAnudrutam = tala.template.includes('U')
              const laghuCount = tala.template.filter(t => t === 'I').length
              const drutamCount = tala.template.filter(t => t === 'O').length
              const fingerNames = ['pinky', 'ring', 'middle', 'index', 'thumb']
              const fingerCount = tala.jathiBeats - 1 // fingers used per laghu
              const maxFinger = Math.min(fingerCount, 5)
              const usedFingers = fingerNames.slice(0, maxFinger).join(' → ')
              const wraps = fingerCount > 5

              const parts = []

              // Laghu description
              if (hasLaghu) {
                const laghuLabel = laghuCount > 1 ? `${laghuCount} Laghus` : '1 Laghu'
                parts.push(
                  `${laghuLabel} (I): each has 1 clap (palm down) + ${fingerCount} finger count${fingerCount !== 1 ? 's' : ''} — ${usedFingers}${wraps ? ' (then repeats from pinky)' : ''}`
                )
              }

              // Drutam description
              if (hasDrutam) {
                const drutamLabel = drutamCount > 1 ? `${drutamCount} Drutams` : '1 Drutam'
                parts.push(
                  `${drutamLabel} (O): each has 1 clap + 1 wave/veechu (palm flipped up)`
                )
              }

              // Anudrutam description
              if (hasAnudrutam) {
                parts.push('1 Anudrutam (U): a single clap')
              }

              // Nadai
              parts.push(
                `Subdivisions: ${nadai.name} nadai (${nadai.sub} sub-ticks per beat)`
              )

              return parts.join('. ') + '.'
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
