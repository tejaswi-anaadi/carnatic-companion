import { useMemo, useState } from 'react'
import { Play, Square, ArrowUp, ArrowDown, Info } from 'lucide-react'
import Piano from './Piano.jsx'
import KatapayadiCalculation from './KatapayadiCalculation.jsx'
import { SWARA_LABEL } from '../lib/swaras.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import { useT } from '../lib/i18n.jsx'

function SwaraRow({ swaras, activeIdx }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {swaras.map((sw, i) => {
        const isActive = i === activeIdx
        return (
          <span
            key={i}
            className={
              'px-2.5 py-1 rounded-md text-sm font-display transition ' +
              (isActive
                ? 'bg-gold text-crimson-dark shadow-glow scale-105'
                : 'bg-cream-dark text-ink border border-gold/30')
            }
          >
            {SWARA_LABEL[sw] ?? sw}
          </span>
        )
      })}
    </div>
  )
}

export default function RagaDetail({ raga, useDikshitar, onToggleNaming }) {
  const audio = useAudioEngine()
  const t = useT()
  const isSa = t.lang === 'sa'
  const [activeSwara, setActiveSwara] = useState(null)
  const [activeIdx, setActiveIdx] = useState({ aro: -1, ava: -1 })
  const [playing, setPlaying] = useState(null) // 'aro' | 'ava' | null

  // Pick scale based on naming tradition.
  const { arohanam, avarohanam, asampoornaNote, asampoornaDiffers } = useMemo(() => {
    if (useDikshitar && raga.asampoorna) {
      return {
        arohanam: raga.asampoorna.arohanam,
        avarohanam: raga.asampoorna.avarohanam,
        asampoornaNote: raga.asampoorna.note,
        asampoornaDiffers: !raga.asampoorna.sameAsParent,
      }
    }
    return {
      arohanam: raga.arohanam,
      avarohanam: raga.avarohanam,
      asampoornaNote: null,
      asampoornaDiffers: false,
    }
  }, [raga, useDikshitar])

  const play = (which) => {
    const seq = which === 'aro' ? arohanam : avarohanam
    setPlaying(which)
    audio.playSequence(
      seq,
      450,
      (sw, i) => {
        setActiveSwara(sw)
        setActiveIdx((p) => ({ ...p, [which]: i }))
      },
      () => {
        setActiveSwara(null)
        setActiveIdx({ aro: -1, ava: -1 })
        setPlaying(null)
      },
    )
  }

  const stop = () => {
    audio.stop()
    setActiveSwara(null)
    setActiveIdx({ aro: -1, ava: -1 })
    setPlaying(null)
  }

  const govindaDisplay = t.govinda(raga.number)
  const dikshitarDisplay = t.dikshitar(raga.number, raga.dikshitarName)

  return (
    <div className="space-y-5">
    <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-saffron">
            Mela #{raga.number} · <span className={isSa ? 'font-devanagari' : ''}>{t.chakra(raga.chakraIdx)}</span> Chakra ({raga.positionInChakra})
          </div>
          <h2 className={'text-3xl md:text-4xl text-crimson font-bold mt-1 ' + (isSa ? 'font-devanagari' : 'font-display')}>
            {useDikshitar ? dikshitarDisplay : govindaDisplay}
          </h2>
          <p className="text-ink/60 text-sm italic mt-1">
            {useDikshitar
              ? <>Sampoorna alias: <span className={'font-semibold not-italic ' + (isSa ? 'font-devanagari' : '')}>{govindaDisplay}</span></>
              : <>Asampoorna alias: <span className={'font-semibold not-italic ' + (isSa ? 'font-devanagari' : '')}>{dikshitarDisplay}</span></>}
          </p>
        </div>

        {/* Naming toggle */}
        <button
          onClick={onToggleNaming}
          className="flex items-center gap-2 px-3 py-2 rounded-full border-2 border-gold bg-cream-dark hover:bg-gold hover:text-crimson-dark transition text-xs font-semibold"
          title="Toggle naming convention"
        >
          <span className={!useDikshitar ? 'text-crimson font-bold' : 'text-ink/50'}>Govinda</span>
          <span className="w-8 h-4 rounded-full bg-cream border border-gold relative">
            <span
              className={'absolute top-0.5 w-3 h-3 rounded-full bg-crimson transition-all ' + (useDikshitar ? 'left-4' : 'left-0.5')}
            />
          </span>
          <span className={useDikshitar ? 'text-crimson font-bold' : 'text-ink/50'}>Dikshitar</span>
        </button>
      </div>

      {/* Madhyamam badge */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-crimson/10 border border-crimson/30 text-crimson text-xs">
          {raga.madhyamam === 'M1' ? 'Suddha Madhyama (M1) · Poorvanga (1–36)' : 'Prati Madhyama (M2) · Uttaranga (37–72)'}
        </span>
        {useDikshitar && asampoornaDiffers && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-saffron/15 border border-saffron/50 text-saffron-dark text-xs font-semibold">
            Asampoorna form (janya) — differs from sampoorna parent
          </span>
        )}
        {useDikshitar && raga.asampoorna && !asampoornaDiffers && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gold/20 border border-gold text-crimson-dark text-xs">
            Asampoorna form is sampoorna · same as parent
          </span>
        )}
      </div>

      {useDikshitar && asampoornaNote && (
        <div className="mb-4 flex gap-2 p-3 rounded-md bg-saffron/5 border-l-4 border-saffron text-sm text-ink/85">
          <Info className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
          <span>{asampoornaNote}</span>
        </div>
      )}

      {/* Arohanam */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-ink/70 flex items-center gap-1.5">
              <ArrowUp className="w-4 h-4 text-saffron" /> Arohanam
            </h3>
            <button
              onClick={() => (playing === 'aro' ? stop() : play('aro'))}
              className={
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ' +
                (playing === 'aro'
                  ? 'bg-crimson text-cream'
                  : 'bg-gold text-crimson-dark hover:bg-gold-dark hover:text-cream')
              }
            >
              {playing === 'aro' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {playing === 'aro' ? 'Stop' : 'Play'}
            </button>
          </div>
          <SwaraRow swaras={arohanam} activeIdx={playing === 'aro' ? activeIdx.aro : -1} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-ink/70 flex items-center gap-1.5">
              <ArrowDown className="w-4 h-4 text-saffron" /> Avarohanam
            </h3>
            <button
              onClick={() => (playing === 'ava' ? stop() : play('ava'))}
              className={
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ' +
                (playing === 'ava'
                  ? 'bg-crimson text-cream'
                  : 'bg-gold text-crimson-dark hover:bg-gold-dark hover:text-cream')
              }
            >
              {playing === 'ava' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {playing === 'ava' ? 'Stop' : 'Play'}
            </button>
          </div>
          <SwaraRow swaras={avarohanam} activeIdx={playing === 'ava' ? activeIdx.ava : -1} />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gold/30">
        <Piano activeSwara={activeSwara} ragaSwaras={arohanam} />
      </div>
    </div>

    {/* Katapayadi step-by-step derivation */}
    <KatapayadiCalculation ragaNumber={raga.number} />
    </div>
  )
}
