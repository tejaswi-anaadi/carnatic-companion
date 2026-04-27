import HandIcon from './HandIcon.jsx'
import { flattenTalaBeats } from '../lib/talas.js'
import { useT } from '../lib/i18n.jsx'

const ANGA_COLOR = {
  I: 'border-crimson/40 bg-crimson/5',
  O: 'border-saffron/50 bg-saffron/5',
  U: 'border-gold-dark/50 bg-gold/10',
}
const ANGA_LABEL_EN = { I: 'Laghu', O: 'Drutam', U: 'Anudrutam' }
const ACTION_LABEL_EN = {
  clap: 'Clap', wave: 'Wave',
  'finger-1': 'Finger 1', 'finger-2': 'Finger 2', 'finger-3': 'Finger 3', 'finger-4': 'Finger 4',
}

export default function TalaVisualizer({ tala, pos, isRunning, nadai }) {
  const t = useT()
  const isSa = t.lang === 'sa'
  const labelFont = isSa ? 'font-devanagari' : ''
  const beats = flattenTalaBeats(tala)
  const activeIdx = isRunning ? pos.beatIdx : -1

  // Group beats back into angas for display.
  let cursor = 0
  const groups = tala.angas.map((anga, angaIdx) => {
    const slice = beats.slice(cursor, cursor + anga.actions.length).map((b, i) => ({
      ...b,
      globalIdx: cursor + i,
    }))
    cursor += anga.actions.length
    return { anga, angaIdx, beats: slice }
  })

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={'px-2.5 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/30 font-semibold ' + labelFont}>
          {t.talaFamily(tala.family)} · {t.jathi(tala.jathi)} {isSa ? t.term('Jathi') : 'jathi'}
        </span>
        <span className={'px-2.5 py-1 rounded-full bg-saffron/10 text-saffron border border-saffron/30 font-semibold ' + labelFont}>
          {tala.totalBeats} {isSa ? 'मात्रा / आवर्त' : 'beats / cycle'}
        </span>
        <span className={'px-2.5 py-1 rounded-full bg-gold/20 text-crimson-dark border border-gold font-semibold ' + labelFont}>
          {t.nadai(nadai.name)} {isSa ? t.term('Nadai') : 'nadai'} · {nadai.sub} {isSa ? 'उपस्वन' : 'sub-clicks'}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-cream-dark text-ink/70 border border-gold/30 font-mono">
          {tala.totalBeats * nadai.sub} {isSa ? 'क्षण' : 'ticks'}
        </span>
      </div>

      {/* Anga groups */}
      <div className="flex flex-wrap gap-3">
        {groups.map(({ anga, angaIdx, beats }) => (
          <div
            key={angaIdx}
            className={
              'rounded-lg border-2 p-2.5 ' + ANGA_COLOR[anga.type]
            }
          >
            <div className="flex items-center justify-between mb-2">
              <span className={'text-[10px] uppercase tracking-[0.15em] font-semibold text-ink/70 ' + labelFont}>
                {isSa ? t.anga(anga.type) : ANGA_LABEL_EN[anga.type]} ({anga.type})
              </span>
              <span className="text-[10px] font-mono text-ink/60">
                {anga.beats} {isSa ? 'मात्रा' : (anga.beats > 1 ? 'beats' : 'beat')}
              </span>
            </div>
            <div className="flex gap-1.5">
              {beats.map((b) => {
                const isActive = activeIdx === b.globalIdx
                return (
                  <div
                    key={b.globalIdx}
                    className={
                      'flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ' +
                      (isActive
                        ? 'bg-gold scale-110 shadow-glow ring-2 ring-crimson'
                        : 'bg-cream border border-gold/30')
                    }
                  >
                    <HandIcon action={b.action} active={isActive} size={64} />
                    <span className={'text-[11px] font-semibold mt-1 ' + labelFont + ' ' + (isActive ? 'text-crimson-dark' : 'text-ink/60')}>
                      {isSa ? (b.action === 'clap' ? 'ताडन' : b.action === 'wave' ? 'विसर्जन' : b.action.startsWith('finger-') ? `अङ्गुली ${b.action.split('-')[1]}` : b.label) : (ACTION_LABEL_EN[b.action] ?? b.label)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
