import { FAMILIES, JATHIS, NADAIS } from '../lib/talas.js'

export default function TalaSelector({
  family, onFamilyChange,
  jathi, onJathiChange,
  nadai, onNadaiChange,
  bpm, onBpmChange,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Family</label>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
          {FAMILIES.map((f) => (
            <button
              key={f.name}
              onClick={() => onFamilyChange(f)}
              className={
                'px-2 py-2 rounded-md border text-sm font-display transition ' +
                (family.name === f.name
                  ? 'bg-crimson text-cream border-gold shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              {f.name}
              <div className="text-[10px] font-mono mt-0.5 opacity-70">{f.template.join(' ')}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Jathi (laghu beats)</label>
        <div className="grid grid-cols-5 gap-1.5">
          {JATHIS.map((j) => (
            <button
              key={j.name}
              onClick={() => onJathiChange(j)}
              className={
                'px-2 py-2 rounded-md border text-sm font-display transition ' +
                (jathi.name === j.name
                  ? 'bg-gold text-crimson-dark border-gold-dark font-semibold shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              {j.name}
              <div className="text-[10px] font-mono opacity-70">{j.beats}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Nadai / Gati (subdivisions)</label>
        <div className="grid grid-cols-5 gap-1.5">
          {NADAIS.map((n) => (
            <button
              key={n.name}
              onClick={() => onNadaiChange(n)}
              className={
                'px-2 py-2 rounded-md border text-sm font-display transition ' +
                (nadai.name === n.name
                  ? 'bg-saffron text-cream border-saffron-dark shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              {n.name}
              <div className="text-[10px] font-mono opacity-70">{n.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-saffron mb-2">
          Tempo (BPM)
          <span className="font-mono text-crimson font-bold text-sm normal-case">{bpm}</span>
        </label>
        <input
          type="range"
          min="40"
          max="180"
          step="2"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value))}
          className="w-full accent-crimson"
        />
      </div>
    </div>
  )
}
