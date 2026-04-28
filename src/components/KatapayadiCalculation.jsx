import { katapayadiCalculation } from '../lib/katapayadi.js'
import { SWARA_LABEL } from '../lib/swaras.js'
import { ArrowRight, Calculator } from 'lucide-react'

// Renders the full step-by-step Kaṭapayādi derivation for a melakartha
// number, mirroring the algorithm in Anaadi Foundation's handout:
//   1. first two syllables -> two digits -> reverse -> mela number
//   2. if > 36 subtract 36 (M2 / Prati Madhyamam, else M1 / Suddha)
//   3. N = revised - 1
//   4. Q = N // 6 -> Ri/Ga pair, R = N % 6 -> Da/Ni pair
// Final scale: S Ri Ga Ma P Da Ni Ṡ
export default function KatapayadiCalculation({ ragaNumber }) {
  const c = katapayadiCalculation(ragaNumber)
  if (!c) return null

  const RI_GA_LABELS = c.riGaTable.map(([r, g]) => `${SWARA_LABEL[r]} ${SWARA_LABEL[g]}`)
  const DA_NI_LABELS = c.daNiTable.map(([d, n]) => `${SWARA_LABEL[d]} ${SWARA_LABEL[n]}`)

  return (
    <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
      <header className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-crimson" />
        <h3 className="font-display text-2xl text-crimson font-bold">Kaṭapayādi Calculation</h3>
      </header>

      <p className="text-ink/75 text-sm mb-5 leading-relaxed">
        The first two syllables of the melakartha's Sanskrit name encode two digits;
        reversed, they give the mela number. From the number, the seven swaras of the scale fall out by a fixed table.
      </p>

      {/* The name with first two syllables highlighted */}
      <div className="text-center mb-5">
        <div className="font-devanagari text-4xl text-crimson font-bold leading-snug">
          <span className="bg-gold/30 px-1 rounded border border-gold">{c.syl1.syllable}</span>
          <span className="bg-saffron/25 px-1 rounded border border-saffron ml-0.5">{c.syl2.syllable}</span>
          <span>{c.devName.slice((c.syl1.syllable + c.syl2.syllable).length)}</span>
        </div>
        <div className="text-xs text-ink/55 italic mt-1">{c.romanName}</div>
      </div>

      {/* Step 1 — digits */}
      <Step n={1} title="Read the digits from the first two syllables">
        <div className="flex flex-wrap items-center gap-3">
          <SyllableChip syllable={c.syl1.syllable} consonant={c.syl1.consonant} digit={c.d1} />
          <SyllableChip syllable={c.syl2.syllable} consonant={c.syl2.consonant} digit={c.d2} />
          <ArrowRight className="w-4 h-4 text-saffron" />
          <span className="font-mono text-lg">"{c.forward}"</span>
          <ArrowRight className="w-4 h-4 text-saffron" />
          <span className="text-xs italic text-ink/60">reversed (Aṅkānāṃ Vāmato Gatiḥ)</span>
          <ArrowRight className="w-4 h-4 text-saffron" />
          <span className="px-3 py-1 rounded-full bg-crimson text-cream font-mono font-bold">
            Mela {c.reversed}
          </span>
        </div>
        {c.note && (
          <div className="mt-2 text-xs text-ink/65 italic">
            <span className="text-saffron font-semibold not-italic">Note:</span> {c.note}
          </div>
        )}
      </Step>

      {/* Step 2 — madhyamam */}
      <Step
        n={2}
        title={c.isM2
          ? `Since ${c.n} > 36, subtract 36 → revised = ${c.revised}; this is M₂ (Prati Madhyama)`
          : `Since ${c.n} ≤ 36, this is M₁ (Suddha Madhyama). Revised number stays ${c.revised}.`}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded font-mono bg-cream-dark border border-gold/40">
            M = {c.n}
          </span>
          {c.isM2 && (
            <>
              <ArrowRight className="w-4 h-4 text-saffron" />
              <span className="font-mono text-ink/70">M − 36</span>
              <ArrowRight className="w-4 h-4 text-saffron" />
            </>
          )}
          <span className="px-2 py-1 rounded font-mono bg-cream-dark border border-gold/40">
            M' = {c.revised}
          </span>
          <span className="px-2 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/30 font-semibold text-xs">
            {c.isM2 ? 'M₂ · Prati' : 'M₁ · Suddha'}
          </span>
        </div>
      </Step>

      {/* Step 3 — N */}
      <Step n={3} title={`Set N = M' − 1 = ${c.revised} − 1 = ${c.N}`}>
        <div className="text-sm font-mono">
          N = <span className="text-crimson font-bold">{c.N}</span>
        </div>
      </Step>

      {/* Step 4 — Q and R */}
      <Step n={4} title={`Divide N by 6: ${c.N} ÷ 6 = ${c.Q} remainder ${c.R}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
          <span className="px-2 py-1 rounded bg-cream-dark border border-gold/40">N = {c.N}</span>
          <ArrowRight className="w-4 h-4 text-saffron" />
          <span className="px-2 py-1 rounded bg-gold/20 border border-gold">Q = {c.Q}</span>
          <span className="px-2 py-1 rounded bg-saffron/15 border border-saffron/50">R = {c.R}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <LookupTable
            title="Q → Ri / Ga"
            items={RI_GA_LABELS}
            highlight={c.Q}
            highlightClasses="bg-gold text-crimson-dark border-gold-dark font-bold"
          />
          <LookupTable
            title="R → Dha / Ni"
            items={DA_NI_LABELS}
            highlight={c.R}
            highlightClasses="bg-saffron/30 text-crimson-dark border-saffron font-bold"
          />
        </div>
      </Step>

      {/* Final scale */}
      <div className="mt-5 pt-4 border-t-2 border-gold/30">
        <div className="text-xs uppercase tracking-[0.2em] text-saffron font-semibold mb-2">
          Resulting scale
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.arohanam.map((sw, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-md font-display text-base bg-gold/20 text-crimson-dark border-2 border-gold"
            >
              {SWARA_LABEL[sw] ?? sw}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <section className="mb-4 last:mb-0">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-crimson text-cream text-xs font-bold font-mono">
          {n}
        </span>
        <h4 className="text-sm font-semibold text-ink/85">{title}</h4>
      </div>
      <div className="ml-8">{children}</div>
    </section>
  )
}

function SyllableChip({ syllable, consonant, digit }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border-2 border-gold">
      <span className="font-devanagari text-2xl text-crimson font-bold leading-none">{syllable}</span>
      <span className="text-ink/60 text-xs">·</span>
      <span className="font-devanagari text-base text-ink leading-none">{consonant}</span>
      <span className="text-saffron font-bold text-xs">=</span>
      <span className="font-mono font-bold text-crimson">{digit}</span>
    </div>
  )
}

function LookupTable({ title, items, highlight, highlightClasses }) {
  return (
    <div className="rounded-md border border-gold/40 bg-cream-dark overflow-hidden">
      <div className="px-2 py-1 text-[11px] uppercase tracking-wider font-semibold text-saffron border-b border-gold/30 bg-cream">
        {title}
      </div>
      <ul className="text-sm font-mono divide-y divide-gold/20">
        {items.map((it, i) => (
          <li
            key={i}
            className={
              'flex items-center gap-2 px-2 py-1 transition ' +
              (i === highlight ? `${highlightClasses} border-l-4` : 'border-l-4 border-transparent')
            }
          >
            <span className="w-4 text-center text-ink/70">{i}</span>
            <ArrowRight className="w-3 h-3 opacity-50" />
            <span className="font-display text-sm">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
