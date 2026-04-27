import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { findMelaByName } from '../lib/katapayadi.js'
import { RAGAS } from '../lib/melakartha.js'
import RagaDetail from './RagaDetail.jsx'

// Devanagari Katapayadi grid as shown in the traditional Sangita treatises.
// Rows are the four consonant-vargas; the bottom-right cell holds the vowels
// (which all decode to 0).
const KATAPAYADI_TABLE = [
  // ka-varga: digits 1..0
  ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
  // Ta + ta combined varga: digits 1..0
  ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
  // pa-varga: digits 1..5; rest blank
  ['प', 'फ', 'ब', 'भ', 'म', '',  '',  '',  '',  ''],
  // ya-varga: digits 1..8 with optional ळ at 9; 0 blank
  ['य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', '(ळ)', ''],
]

const VOWEL_LIST = 'अ, आ, इ, ई, उ, ऊ, ऋ, ॠ, ऌ, ए, ऐ, ओ, औ'

export default function KatapayadiDecoder() {
  const [input, setInput] = useState('')
  const [showCheat, setShowCheat] = useState(false)
  const [useDikshitar, setUseDikshitar] = useState(false)

  const trimmed = input.trim()
  const numericMatch = /^\d{1,2}$/.test(trimmed)

  const result = useMemo(() => {
    if (!trimmed) return null
    if (numericMatch) {
      const n = parseInt(trimmed)
      if (n >= 1 && n <= 72) return { mode: 'number', value: n }
      return { mode: 'invalid', reason: 'Number must be between 1 and 72.' }
    }
    const hit = findMelaByName(trimmed)
    if (hit) return { mode: 'name', ...hit }
    return { mode: 'name', notFound: true }
  }, [trimmed, numericMatch])

  const ragaToShow = useMemo(() => {
    if (!result) return null
    if (result.mode === 'number') return RAGAS[result.value - 1]
    if (result.mode === 'name' && !result.notFound) return RAGAS[result.number - 1]
    return null
  }, [result])

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 paper">
        <label className="block text-xs uppercase tracking-[0.2em] text-saffron mb-2">
          Decode by raga name or number
        </label>
        <input
          type="text"
          placeholder="e.g. Mechakalyani  ·  65  ·  Sankarabharanam"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border-2 border-gold/40 bg-cream-dark focus:border-crimson focus:outline-none text-lg font-display text-ink"
        />

        {result?.mode === 'name' && !result.notFound && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-ink/80">
              Matched as the{' '}
              <strong className="text-crimson">
                {result.source === 'sampoorna' ? 'Sampoorna (Govinda)' : 'Asampoorna (Dikshitar)'}
              </strong>{' '}
              name
            </span>
            <ArrowRight className="w-4 h-4 text-saffron" />
            <span className="px-3 py-0.5 rounded-full bg-crimson text-cream font-mono font-bold">
              Mela {result.number}
            </span>
          </div>
        )}

        {result?.mode === 'name' && result.notFound && (
          <div className="mt-3 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
            <span className="text-ink/80">
              <strong className="text-crimson">"{trimmed}"</strong> is not a melakartha raga (Sampoorna or Asampoorna).
              It may be a janya raga, or the spelling may not match. Try one of the 72 sampoorna or asampoorna names, or enter a number 1–72.
            </span>
          </div>
        )}

        {result?.mode === 'number' && (
          <div className="mt-3 text-sm text-ink/70">
            Showing melakartha <span className="font-bold text-crimson">#{result.value}</span>.
          </div>
        )}

        {result?.mode === 'invalid' && (
          <div className="mt-3 text-sm text-crimson italic">{result.reason}</div>
        )}
      </div>

      {/* Matched raga detail */}
      {ragaToShow && (
        <RagaDetail
          raga={ragaToShow}
          useDikshitar={useDikshitar}
          onToggleNaming={() => setUseDikshitar((v) => !v)}
        />
      )}

      {/* Cheat sheet */}
      <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple paper overflow-hidden">
        <button
          onClick={() => setShowCheat((v) => !v)}
          className="w-full flex items-center gap-2 px-5 py-3 bg-gold/20 hover:bg-gold/30 transition text-left"
        >
          {showCheat ? <ChevronDown className="w-4 h-4 text-crimson" /> : <ChevronRight className="w-4 h-4 text-crimson" />}
          <BookOpen className="w-4 h-4 text-crimson" />
          <span className="font-display text-lg text-crimson font-semibold">Kaṭapayādi Number System</span>
        </button>
        {showCheat && (
          <div className="p-5 space-y-5">
            <p className="text-ink/80 leading-relaxed text-sm">
              The <strong>Kaṭapayādi sankhyā</strong> assigns a digit to each consonant; vowels count as zero.
              The first two consonants of a melakartha's full name encode two digits;
              <strong> reverse them</strong> (the rule <em>Aṅkānāṃ Vāmato Gatiḥ</em>) to read the mela number.
            </p>

            {/* Table */}
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="border-collapse w-full text-center mx-auto" style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    {[1,2,3,4,5,6,7,8,9,0].map((d) => (
                      <th
                        key={d}
                        className="border-2 border-ink/40 bg-cream-dark px-2 py-2 text-base font-bold text-crimson"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KATAPAYADI_TABLE.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-ink/40 px-1 py-2.5 font-devanagari text-xl text-ink"
                          style={{ minWidth: 36 }}
                        >
                          {cell || ' '}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="9" className="border border-ink/40 bg-cream-dark/30 px-1 py-2"></td>
                    <td
                      className="border border-ink/40 bg-cream-dark px-2 py-2 font-devanagari text-[13px] leading-tight text-ink"
                      style={{ minWidth: 36 }}
                    >
                      {VOWEL_LIST}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs italic text-ink/60 mt-2 text-center">
                Vowels (in the 0-cell) and any standalone vowel mark count as zero.
              </p>
            </div>

            {/* Worked examples in Devanagari */}
            <div className="rounded-lg bg-crimson/5 border-l-4 border-crimson p-4 space-y-4">
              <div className="text-xs uppercase tracking-[0.15em] text-crimson font-semibold">Worked examples</div>

              <div>
                <div className="font-devanagari text-2xl text-crimson font-bold mb-1">मेचकल्याणि</div>
                <div className="flex items-center flex-wrap gap-2 text-sm font-mono text-ink/85">
                  <span><span className="font-devanagari text-lg align-middle">म</span> = 5</span>
                  <span>·</span>
                  <span><span className="font-devanagari text-lg align-middle">च</span> = 6</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span>"56"</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="text-xs italic text-ink/60">reversed</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="px-2 py-0.5 rounded-full bg-crimson text-cream text-xs font-bold">Mela 65 — Mechakalyani</span>
                </div>
              </div>

              <div>
                <div className="font-devanagari text-2xl text-crimson font-bold mb-1">धीरशङ्कराभरणम्</div>
                <div className="flex items-center flex-wrap gap-2 text-sm font-mono text-ink/85">
                  <span><span className="font-devanagari text-lg align-middle">ध</span> = 9</span>
                  <span>·</span>
                  <span><span className="font-devanagari text-lg align-middle">र</span> = 2</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span>"92"</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="text-xs italic text-ink/60">reversed</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="px-2 py-0.5 rounded-full bg-crimson text-cream text-xs font-bold">Mela 29 — Dheerasankarabharanam</span>
                </div>
              </div>

              <div>
                <div className="font-devanagari text-2xl text-crimson font-bold mb-1">हनुमत्तोडि</div>
                <div className="flex items-center flex-wrap gap-2 text-sm font-mono text-ink/85">
                  <span><span className="font-devanagari text-lg align-middle">ह</span> = 8</span>
                  <span>·</span>
                  <span><span className="font-devanagari text-lg align-middle">न</span> = 0</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span>"80"</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="text-xs italic text-ink/60">reversed</span>
                  <ArrowRight className="w-4 h-4 text-saffron" />
                  <span className="px-2 py-0.5 rounded-full bg-crimson text-cream text-xs font-bold">Mela 8 — Hanumathodi</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
