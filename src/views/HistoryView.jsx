import { useState } from 'react'
import ComposerCard from '../components/ComposerCard.jsx'
import { TRINITY } from '../lib/trinityData.js'

export default function HistoryView() {
  const [activeId, setActiveId] = useState(TRINITY[0].id)
  const active = TRINITY.find((c) => c.id === activeId)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          The Carnatic Trinity
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Born in the same town within five years of each other — three saints whose compositions still define the concert stage.
        </p>
      </header>

      {/* Tabs (md+) / scroll snap (sm) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
        {TRINITY.map((c) => {
          const isActive = activeId === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={
                'shrink-0 px-4 py-2.5 rounded-full border-2 font-display text-base transition ' +
                (isActive
                  ? 'bg-crimson text-cream border-gold shadow-temple'
                  : 'bg-cream border-gold/40 text-crimson hover:border-gold')
              }
            >
              {c.name}
              <span className={'ml-2 text-[10px] font-sans ' + (isActive ? 'text-gold-light' : 'text-ink/50')}>
                {c.dates}
              </span>
            </button>
          )
        })}
      </div>

      <ComposerCard composer={active} />
    </div>
  )
}
