export default function RagaCard({ raga, useDikshitar, isSelected, onSelect }) {
  const name = useDikshitar ? raga.dikshitarName : raga.name
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
        <span className="font-display text-lg leading-tight">{name}</span>
      </div>
    </button>
  )
}
