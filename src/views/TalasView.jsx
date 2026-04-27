import { useMemo, useState } from 'react'
import { Play, Square } from 'lucide-react'
import TalaSelector from '../components/TalaSelector.jsx'
import TalaVisualizer from '../components/TalaVisualizer.jsx'
import { FAMILIES, JATHIS, NADAIS, buildTala } from '../lib/talas.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import { useMetronome } from '../hooks/useMetronome.js'
import { useT } from '../lib/i18n.jsx'

export default function TalasView() {
  const [family, setFamily] = useState(FAMILIES[4]) // Triputa
  const [jathi, setJathi] = useState(JATHIS[1])     // Chatusra
  const [nadai, setNadai] = useState(NADAIS[1])     // Chatusra
  const [bpm, setBpm] = useState(72)

  const tala = useMemo(() => buildTala(family, jathi), [family, jathi])
  const audio = useAudioEngine()
  const { isRunning, pos, start, stop } = useMetronome({ audio, tala, nadai: nadai.sub, bpm })
  const t = useT()
  const isSa = t.lang === 'sa'

  return (
    <div className="space-y-6">
      <header>
        <h2 className={'text-3xl md:text-4xl text-crimson font-bold ' + (isSa ? 'font-devanagari' : 'font-display')}>
          {isSa ? 'सूळादि सप्त ताल' : 'Suladi Sapta Talas'}
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          {isSa
            ? 'सात कुल, पाँच जाति, पाँच नडै — देखें और सुनें कि प्रत्येक ताल ताडन, विसर्जन और अङ्गुली गणना में कैसे प्रकट होता है।'
            : 'Seven families, five jathis, five nadais — see and hear how each tala unfolds in claps, waves, and finger counts.'}
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
              <h3 className={'text-2xl text-crimson font-semibold ' + (isSa ? 'font-devanagari' : 'font-display')}>
                {t.talaFamily(tala.family)} · {t.jathi(tala.jathi)} {isSa ? t.term('Jathi') : 'jathi'}
              </h3>
              <div className="text-xs text-ink/60 font-mono mt-0.5">
                {isSa ? 'क्रम' : 'Template'}: {tala.template.join(' ')} · {isSa ? 'मात्रा' : 'Beats'}: {tala.angas.map((a) => a.beats).join(' + ')} = {tala.totalBeats}
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
              {isSa ? (isRunning ? 'ताल रोकें' : 'ताल आरम्भ') : (isRunning ? 'Stop Tala' : 'Start Tala')}
            </button>
          </div>

          <TalaVisualizer tala={tala} pos={pos} isRunning={isRunning} nadai={nadai} />

          <div className="text-[11px] text-ink/55 italic border-t border-gold/30 pt-3">
            <strong className="not-italic text-crimson">Legend:</strong> Clap = palm strike (bright tick); Wave = palm flip (warm thud);
            Finger 1–4 = pinky → ring → middle → index counts (soft tick). Subdivisions ({nadai.name} = {nadai.sub}) play as quiet sub-ticks between main beats.
          </div>
        </div>
      </div>
    </div>
  )
}
