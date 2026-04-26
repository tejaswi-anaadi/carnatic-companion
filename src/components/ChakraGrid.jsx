import { CHAKRA_GROUPS } from '../lib/melakartha.js'

export default function ChakraGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {CHAKRA_GROUPS.map((c) => {
        const isActive = selected === c.idx
        return (
          <button
            key={c.idx}
            onClick={() => onSelect(c.idx)}
            className={
              'relative text-left rounded-xl border-2 p-4 transition group ' +
              (isActive
                ? 'bg-crimson text-cream border-gold shadow-temple'
                : 'bg-cream border-gold/40 hover:border-gold hover:shadow-temple')
            }
          >
            <div className="flex items-baseline justify-between">
              <span className={'text-[10px] uppercase tracking-[0.2em] ' + (isActive ? 'text-gold-light' : 'text-saffron')}>
                Chakra {c.idx + 1}
              </span>
              <span className={'text-xs ' + (isActive ? 'text-cream/70' : 'text-ink/50')}>
                #{c.ragas[0].number}–{c.ragas[5].number}
              </span>
            </div>
            <div className={'font-display text-2xl mt-1 ' + (isActive ? 'text-cream' : 'text-crimson')}>
              {c.name}
            </div>
            <div className={'text-xs italic ' + (isActive ? 'text-cream/70' : 'text-ink/60')}>
              {c.meaning}
            </div>
          </button>
        )
      })}
    </div>
  )
}
