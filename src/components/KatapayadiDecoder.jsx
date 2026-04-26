import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ArrowRight, BookOpen } from 'lucide-react'
import { decode, tokenize, CHEAT_SHEET } from '../lib/katapayadi.js'
import { RAGAS } from '../lib/melakartha.js'
import RagaDetail from './RagaDetail.jsx'

export default function KatapayadiDecoder() {
  const [input, setInput] = useState('')
  const [showCheat, setShowCheat] = useState(false)
  const [useDikshitar, setUseDikshitar] = useState(false)

  const trimmed = input.trim()
  const numericMatch = /^\d{1,2}$/.test(trimmed)

  const decoded = useMemo(() => {
    if (!trimmed) return null
    if (numericMatch) {
      const n = parseInt(trimmed)
      if (n >= 1 && n <= 72) return { mode: 'number', value: n }
      return { mode: 'invalid', reason: 'Number must be 1..72' }
    }
    const result = decode(trimmed)
    return { mode: 'name', ...result, allTokens: tokenize(trimmed) }
  }, [trimmed, numericMatch])

  const ragaToShow = useMemo(() => {
    if (!decoded) return null
    if (decoded.mode === 'number') return RAGAS[decoded.value - 1]
    if (decoded.mode === 'name' && decoded.ok) return RAGAS[decoded.value - 1]
    return null
  }, [decoded])

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 paper">
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">
          Decode by raga name or number
        </label>
        <input
          type="text"
          placeholder="e.g. Mechakalyani  or  65  or  Sankarabharanam"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border-2 border-gold/40 bg-cream-dark focus:border-crimson focus:outline-none text-lg font-display text-ink"
        />

        {decoded && decoded.mode === 'name' && (
          <div className="mt-4 space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-ink/60">Katapayadi parse</div>
            <div className="flex flex-wrap items-center gap-2">
              {decoded.allTokens.map((t, i) => (
                <span
                  key={i}
                  className={
                    'px-2 py-1 rounded-md font-mono text-sm border ' +
                    (i < 2
                      ? 'bg-gold text-crimson-dark border-gold-dark font-bold'
                      : 'bg-cream-dark text-ink/50 border-gold/30')
                  }
                >
                  {t.chunk} → {t.digit}
                </span>
              ))}
            </div>

            {decoded.ok ? (
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="font-mono px-2 py-1 rounded bg-cream-dark border border-gold/30">
                  {decoded.tokens[0].chunk}({decoded.tokens[0].digit}) {decoded.tokens[1].chunk}({decoded.tokens[1].digit})
                </span>
                <ArrowRight className="w-4 h-4 text-saffron" />
                <span className="font-mono px-2 py-1 rounded bg-cream-dark border border-gold/30">
                  {decoded.forward}
                </span>
                <ArrowRight className="w-4 h-4 text-saffron" />
                <span className="text-xs text-ink/60">reversed (Aṅkānāṃ Vāmato Gatiḥ)</span>
                <ArrowRight className="w-4 h-4 text-saffron" />
                <span className="px-3 py-1 rounded-full bg-crimson text-cream font-mono font-bold">
                  Mela {decoded.value}
                </span>
              </div>
            ) : (
              <div className="text-sm text-crimson italic">
                {decoded.reason || `Decoded to ${decoded.value} — out of melakartha range (1..72).`}
              </div>
            )}
          </div>
        )}

        {decoded && decoded.mode === 'number' && (
          <div className="mt-3 text-sm text-ink/70">
            Showing melakartha <span className="font-bold text-crimson">#{decoded.value}</span>.
          </div>
        )}

        {decoded && decoded.mode === 'invalid' && (
          <div className="mt-3 text-sm text-crimson italic">{decoded.reason}</div>
        )}
      </div>

      {ragaToShow && (
        <RagaDetail
          raga={ragaToShow}
          useDikshitar={useDikshitar}
          onToggleNaming={() => setUseDikshitar((v) => !v)}
        />
      )}

      <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple paper overflow-hidden">
        <button
          onClick={() => setShowCheat((v) => !v)}
          className="w-full flex items-center gap-2 px-5 py-3 bg-gold/20 hover:bg-gold/30 transition text-left"
        >
          {showCheat ? <ChevronDown className="w-4 h-4 text-crimson" /> : <ChevronRight className="w-4 h-4 text-crimson" />}
          <BookOpen className="w-4 h-4 text-crimson" />
          <span className="font-display text-lg text-crimson font-semibold">Katapayadi cheat sheet</span>
        </button>
        {showCheat && (
          <div className="p-5 text-sm space-y-4">
            <p className="text-ink/80 leading-relaxed">
              <strong>Katapayadi sankhya</strong> assigns a digit to each consonant, ignoring vowels.
              The first two consonants of a melakartha's full name encode two digits;
              <strong> reverse them</strong> (the rule <em>Aṅkānāṃ Vāmato Gatiḥ</em>) to read the mela number.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CHEAT_SHEET.map((c) => (
                <div key={c.row} className="rounded-md bg-cream-dark border border-gold/30 p-2">
                  <div className="text-[11px] font-bold text-crimson font-display mb-1">{c.row}</div>
                  <ul className="text-[11px] font-mono text-ink/80 space-y-0.5">
                    {c.items.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-crimson/5 border-l-4 border-crimson p-3">
              <div className="text-xs uppercase tracking-[0.15em] text-crimson font-semibold mb-1">Worked example</div>
              <p className="text-sm text-ink/85 font-mono">
                "<span className="text-crimson font-bold">Me</span><span className="text-crimson font-bold">cha</span>kalyani"
                → m=5, ch=6 → "56" → reversed → <strong>65 = Mechakalyani</strong> ✓
              </p>
              <p className="text-sm text-ink/85 font-mono mt-1">
                "<span className="text-crimson font-bold">Dhee</span><span className="text-crimson font-bold">ra</span>sankarabharanam"
                → dh=9, r=2 → "92" → reversed → <strong>29 = Dheerasankarabharanam</strong> ✓
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
