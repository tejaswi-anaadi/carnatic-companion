import { FAMILIES, JATHIS, NADAIS } from '../lib/talas.js'
import { useT } from '../lib/i18n.jsx'

export default function TalaSelector({
  family, onFamilyChange,
  jathi, onJathiChange,
  nadai, onNadaiChange,
  bpm, onBpmChange,
}) {
  const t = useT()
  const isSa = t.lang === 'sa'
  // Names of family/jathi/nadai are translated; field labels stay English.
  const nameFont = isSa ? 'font-devanagari' : 'font-display'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Family</label>
        <div className="flex flex-wrap gap-1.5">
          {FAMILIES.map((f) => (
            <button
              key={f.name}
              onClick={() => onFamilyChange(f)}
              className={
                'flex-1 min-w-[88px] px-2.5 py-2 rounded-md border text-sm whitespace-nowrap transition ' + nameFont + ' ' +
                (family.name === f.name
                  ? 'bg-crimson text-cream border-gold shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              <div className="leading-tight">{t.talaFamily(f.name)}</div>
              <div className="text-[10px] font-mono mt-0.5 opacity-70 tracking-wider">{f.template.join(' ')}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Jathi (laghu beats)</label>
        <div className="flex flex-wrap gap-1.5">
          {JATHIS.map((j) => (
            <button
              key={j.name}
              onClick={() => onJathiChange(j)}
              className={
                'flex-1 min-w-[78px] px-2.5 py-2 rounded-md border text-sm whitespace-nowrap transition ' + nameFont + ' ' +
                (jathi.name === j.name
                  ? 'bg-gold text-crimson-dark border-gold-dark font-semibold shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              <div className="leading-tight">{t.jathi(j.name)}</div>
              <div className="text-[10px] font-mono opacity-70">{j.beats}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">Nadai / Gati (subdivisions)</label>
        <div className="flex flex-wrap gap-1.5">
          {NADAIS.map((n) => (
            <button
              key={n.name}
              onClick={() => onNadaiChange(n)}
              className={
                'flex-1 min-w-[78px] px-2.5 py-2 rounded-md border text-sm whitespace-nowrap transition ' + nameFont + ' ' +
                (nadai.name === n.name
                  ? 'bg-saffron text-cream border-saffron-dark shadow-temple'
                  : 'bg-cream border-gold/40 hover:border-gold')
              }
            >
              <div className="leading-tight">{t.nadai(n.name)}</div>
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
