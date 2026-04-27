import HandIcon from './HandIcon.jsx'
import { flattenTalaBeats } from '../lib/talas.js'

const ANGA_COLOR = {
  I: 'border-crimson/40 bg-crimson/5',
  O: 'border-saffron/50 bg-saffron/5',
  U: 'border-gold-dark/50 bg-gold/10',
}
const ANGA_LABEL = { I: 'Laghu', O: 'Drutam', U: 'Anudrutam' }

export default function TalaVisualizer({ tala, pos, isRunning, nadai }) {
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
        <span className="px-2.5 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/30 font-semibold">
          {tala.family} · {tala.jathi} jathi
        </span>
        <span className="px-2.5 py-1 rounded-full bg-saffron/10 text-saffron border border-saffron/30 font-semibold">
          {tala.totalBeats} beats / cycle
        </span>
        <span className="px-2.5 py-1 rounded-full bg-gold/20 text-crimson-dark border border-gold font-semibold">
          {nadai.name} nadai · {nadai.sub} sub-clicks
        </span>
        <span className="px-2.5 py-1 rounded-full bg-cream-dark text-ink/70 border border-gold/30 font-mono">
          {tala.totalBeats * nadai.sub} ticks
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
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-ink/70">
                {ANGA_LABEL[anga.type]} ({anga.type})
              </span>
              <span className="text-[10px] font-mono text-ink/60">{anga.beats} beat{anga.beats > 1 ? 's' : ''}</span>
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
                    <span className={'text-[11px] font-semibold mt-1 ' + (isActive ? 'text-crimson-dark' : 'text-ink/60')}>
                      {b.label}
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
