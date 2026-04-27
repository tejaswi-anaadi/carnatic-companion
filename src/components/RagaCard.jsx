import { useT } from '../lib/i18n.jsx'

export default function RagaCard({ raga, useDikshitar, isSelected, onSelect }) {
  const t = useT()
  const isSa = t.lang === 'sa'
  const name = useDikshitar
    ? t.dikshitar(raga.number, raga.dikshitarName)
    : t.govinda(raga.number)
  return (
    <button
      onClick={() => onSelect(raga.number)}
      className={
        'w-full text-left rounded-lg border-2 p-3 transition ' +
        (isSelected
          ? 'bg-gold text-crimson-dark border-gold-dark shadow-temple font-semibold'
          : 'bg-cream border-gold/40 hover:border-gold hover:bg-cream-dark')
      }
    >
      <div className="flex items-baseline gap-2">
        <span className={'text-[10px] font-mono ' + (isSelected ? 'text-crimson-dark/70' : 'text-saffron')}>
          #{raga.number}
        </span>
        <span className={'text-lg leading-tight ' + (isSa ? 'font-devanagari' : 'font-display')}>{name}</span>
      </div>
    </button>
  )
}
