import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import MelakartaWheel from '../components/MelakartaWheel.jsx'
import RagaCard from '../components/RagaCard.jsx'
import RagaDetail from '../components/RagaDetail.jsx'
import { CHAKRA_GROUPS, RAGAS } from '../lib/melakartha.js'

export default function RagasView({ initialRagaNumber = null }) {
  const [selectedChakra, setSelectedChakra] = useState(initialRagaNumber ? RAGAS[initialRagaNumber - 1].chakraIdx : null)
  const [selectedRaga, setSelectedRaga] = useState(initialRagaNumber)
  const [useDikshitar, setUseDikshitar] = useState(false)

  const ragaObj = selectedRaga ? RAGAS[selectedRaga - 1] : null
  const chakra = selectedChakra != null ? CHAKRA_GROUPS[selectedChakra] : null

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          The 72 Melakartha Ragas
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Twelve chakras × six ragas. Tap a chakra to explore its six melas, then a raga to hear its arohanam and avarohanam.
        </p>
      </header>

      {selectedChakra == null && (
        <MelakartaWheel
          onSelectChakra={(idx) => setSelectedChakra(idx)}
          onSelectRaga={(num) => {
            const r = RAGAS[num - 1]
            setSelectedChakra(r.chakraIdx)
            setSelectedRaga(num)
          }}
        />
      )}

      {selectedChakra != null && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedChakra(null); setSelectedRaga(null) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cream-dark border border-gold/40 text-crimson text-sm font-semibold hover:bg-gold hover:text-crimson-dark"
            >
              <ChevronLeft className="w-4 h-4" /> Chakras
            </button>
            <div className="text-ink/70 text-sm">
              <span className="text-saffron font-semibold">{chakra.name}</span> chakra · {chakra.meaning}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {chakra.ragas.map((r) => (
              <RagaCard
                key={r.number}
                raga={r}
                useDikshitar={useDikshitar}
                isSelected={selectedRaga === r.number}
                onSelect={setSelectedRaga}
              />
            ))}
          </div>

          {ragaObj && (
            <RagaDetail
              raga={ragaObj}
              useDikshitar={useDikshitar}
              onToggleNaming={() => setUseDikshitar((v) => !v)}
            />
          )}
        </div>
      )}
    </div>
  )
}
