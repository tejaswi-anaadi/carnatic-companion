import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Square, Search, ChevronDown } from 'lucide-react'
import { RAGAS } from '../lib/melakartha.js'
import { SWARA_LABEL, SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'
import {
  VARISAI_CATEGORIES,
  RELATIVE_NOTE_LABELS,
  SPEEDS,
  DEFAULT_BAR_POSITIONS,
  noteMsForSpeed,
  relativeNoteFor,
  buildSchedule,
  getCategory,
} from '../lib/varisai.js'
import { SHRUTIS, DEFAULT_SHRUTI_ID, findShruti } from '../lib/shrutis.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import { useT } from '../lib/i18n.jsx'

const DEFAULT_RAGA_NUMBER = 15 // Mayamalavagowla
const BASE_BPM = 72

// Map a raga's arohanam + a relative index -> Hz, anchored at the
// chosen shruti (`baseHz` = frequency of "Sa" for this rendition).
function freqForIndex(arohanam, idx, baseHz) {
  const { pos, octaveShift } = relativeNoteFor(idx)
  const sw = arohanam[pos]
  const semi = (SWARA_SEMITONE[sw] ?? 0) + octaveShift * 12
  return semitoneToFreq(semi, baseHz)
}

// Searchable dropdown for the 72 melas. Compact, keyboard-friendly.
function RagaSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const t = useT()
  const isSa = t.lang === 'sa'
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = RAGAS[value - 1]
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return RAGAS
    return RAGAS.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.dikshitarName.toLowerCase().includes(q) ||
      String(r.number).includes(q)
    )
  }, [query])

  return (
    <div ref={ref} className="relative w-full sm:w-72">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-saffron">Mela #{selected.number}</span>
          <span className={'block truncate text-crimson font-semibold ' + (isSa ? 'font-devanagari' : 'font-display')}>
            {t.govinda(selected.number)}
          </span>
        </span>
        <ChevronDown className={'w-4 h-4 text-crimson shrink-0 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-80 overflow-hidden rounded-lg border-2 border-gold bg-cream shadow-temple">
          <div className="flex items-center gap-2 px-2 py-2 border-b border-gold/40 bg-cream-dark">
            <Search className="w-4 h-4 text-crimson" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 72 melas…"
              className="w-full bg-transparent text-sm focus:outline-none text-ink placeholder:text-ink/40"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {filtered.map((r) => {
              const isSel = r.number === value
              return (
                <li key={r.number}>
                  <button
                    onClick={() => { onChange(r.number); setOpen(false); setQuery('') }}
                    className={
                      'w-full text-left px-3 py-1.5 flex items-baseline gap-2 text-sm transition ' +
                      (isSel ? 'bg-gold text-crimson-dark font-semibold' : 'hover:bg-cream-dark text-ink')
                    }
                  >
                    <span className="text-[10px] tabular-nums text-saffron w-6 shrink-0">#{r.number}</span>
                    <span className={'truncate ' + (isSa ? 'font-devanagari' : '')}>{t.govinda(r.number)}</span>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink/60 italic">No melas match "{query}"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// Compact shruti picker — clicks expand a dropdown of all 12 kattais.
function ShrutiSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = findShruti(value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition min-w-[7rem]"
      >
        <span className="text-left whitespace-nowrap">
          <span className="block text-crimson font-semibold leading-tight">
            {selected.kattai} <span className="text-ink/55 font-normal">({selected.note})</span>
          </span>
          <span className="block text-[9px] text-ink/45 tabular-nums leading-tight">{selected.hz.toFixed(1)} Hz</span>
        </span>
        <ChevronDown className={'w-4 h-4 text-crimson shrink-0 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 right-0 min-w-full rounded-lg border-2 border-gold bg-cream shadow-temple overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {SHRUTIS.map((s) => {
              const isSel = s.id === value
              return (
                <li key={s.id}>
                  <button
                    onClick={() => { onChange(s.id); setOpen(false) }}
                    className={
                      'w-full text-left px-3 py-1.5 flex items-baseline justify-between gap-3 text-sm transition whitespace-nowrap ' +
                      (isSel ? 'bg-gold text-crimson-dark font-semibold' : 'hover:bg-cream-dark text-ink')
                    }
                  >
                    <span>
                      <span className="font-semibold mr-1.5 inline-block w-6 tabular-nums">{s.kattai}</span>
                      <span className={isSel ? 'text-crimson-dark/80' : 'text-ink/60'}>{s.note}</span>
                    </span>
                    <span className={'text-[10px] tabular-nums ' + (isSel ? 'text-crimson-dark/70' : 'text-saffron')}>
                      {s.hz.toFixed(1)} Hz
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function SwaraLegend({ raga }) {
  return (
    <div className="rounded-xl bg-cream-dark border border-gold/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-saffron mb-1.5">Swarasthanas</div>
      <div className="flex flex-wrap gap-1.5">
        {raga.arohanam.map((sw, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-cream border border-gold/40 text-xs text-ink">
            <span className="font-display text-crimson font-semibold mr-1">{RELATIVE_NOTE_LABELS[i]}</span>
            <span className="text-ink/70">= {SWARA_LABEL[sw] ?? sw}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// One line of swaras (variable length per tala). `barPositions` is a list
// of 1-indexed akshara positions AFTER which a bar line is drawn — this
// lets the renderer reflect the laghu / drutham / anudhrutham boundaries
// of whatever tala the pattern uses (Adi for sarali/janta/dhatu, or any
// of the seven alankaram talas). Sustain cells (null) render as kaarvai.
function PatternLine({ indices, lineOffset, cellToGroup, activeGroup, barPositions = DEFAULT_BAR_POSITIONS }) {
  return (
    <div className="flex items-stretch gap-0.5">
      {indices.map((idx, cellIdx) => {
        const globalCell = lineOffset + cellIdx
        const group = cellToGroup[globalCell]
        const isActive = activeGroup >= 0 && group === activeGroup
        const isSustain = idx == null
        const showBarAfter = barPositions.includes(cellIdx + 1)
        const note = isSustain ? null : relativeNoteFor(idx)
        return (
          <div key={cellIdx} className={'flex items-stretch ' + (showBarAfter ? 'pr-1.5' : '')}>
            <span
              className={
                'w-9 sm:w-10 text-center px-1 py-1.5 rounded-md text-sm font-display transition ' +
                (isActive
                  ? 'bg-gold text-crimson-dark shadow-glow scale-105 font-bold'
                  : isSustain
                    ? 'bg-cream-dark/60 border border-gold/20 text-ink/40'
                    : 'bg-cream border border-gold/30 text-ink')
              }
            >
              {isSustain ? (
                <span className="text-ink/50">,</span>
              ) : (
                <>
                  {note.octaveShift > 0 && <span className="text-[9px] align-top text-saffron mr-0.5">•</span>}
                  {note.label}
                  {note.octaveShift < 0 && <span className="text-[9px] align-bottom text-saffron ml-0.5">•</span>}
                </>
              )}
            </span>
            {showBarAfter && (
              <span className="ml-1 w-px bg-gold/50" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function VarisaiView() {
  const audio = useAudioEngine()
  const t = useT()
  const isSa = t.lang === 'sa'

  const [category, setCategory] = useState('sarali')
  const [ragaNumber, setRagaNumber] = useState(DEFAULT_RAGA_NUMBER)
  const [speed, setSpeed] = useState(1)
  const [shrutiId, setShrutiId] = useState(DEFAULT_SHRUTI_ID)
  const [repeat, setRepeat] = useState(1) // 1, 2, or 3 — how many times to play through
  // selectedPatternId is keyed per-category since each category has its
  // own numbering. Track all selections so switching back to a category
  // restores the user's previous choice.
  const [selectedByCat, setSelectedByCat] = useState({
    sarali: 1, janta: 1, dhatu: 1, alankaram: 1,
  })
  const [playing, setPlaying] = useState(false)
  const [activeGroup, setActiveGroup] = useState(-1)
  const [activeRepeat, setActiveRepeat] = useState(0) // 0-indexed iteration for header display

  const raga = RAGAS[ragaNumber - 1]
  const shruti = findShruti(shrutiId)
  const categoryObj = getCategory(category)
  const patterns = categoryObj.patterns
  const selectedPatternId = selectedByCat[category] ?? patterns[0]?.id
  const setSelectedPatternId = (id) => setSelectedByCat((m) => ({ ...m, [category]: id }))
  const pattern = useMemo(
    () => patterns.find((p) => p.id === selectedPatternId) ?? patterns[0],
    [patterns, selectedPatternId]
  )
  const noteMs = useMemo(() => noteMsForSpeed(BASE_BPM, speed), [speed])

  // Flatten lines and resolve to a sounded-note schedule. Each note's freq
  // is anchored at the chosen shruti so playback transposes globally.
  const flatIndices = useMemo(() => pattern.lines.flat(), [pattern])
  const { notes, cellToGroup } = useMemo(
    () => buildSchedule(flatIndices, (idx) => freqForIndex(raga.arohanam, idx, shruti.hz), noteMs),
    [flatIndices, raga, noteMs, shruti.hz]
  )

  // Stop on any control change.
  useEffect(() => {
    audio.stop()
    setPlaying(false)
    setActiveGroup(-1)
    setActiveRepeat(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, ragaNumber, selectedPatternId, speed, shrutiId, repeat])

  const handlePlay = () => {
    if (playing) {
      audio.stop()
      setPlaying(false)
      setActiveGroup(-1)
      setActiveRepeat(0)
      return
    }
    setPlaying(true)
    setActiveGroup(-1)
    setActiveRepeat(0)
    // Concatenate `notes` `repeat` times for playback. Visual highlights
    // map back via `i % notes.length` so the same on-screen cells light
    // up on each iteration, while the displayed iteration counter (1/2,
    // 2/2, …) makes progress through the repeats visible.
    const N = notes.length
    const repeatedNotes = []
    for (let r = 0; r < repeat; r++) repeatedNotes.push(...notes)
    audio.playNotes(
      repeatedNotes,
      (_n, i) => {
        setActiveGroup(i % N)
        setActiveRepeat(Math.floor(i / N))
      },
      () => { setPlaying(false); setActiveGroup(-1); setActiveRepeat(0) },
    )
  }

  // Lines may have different lengths (Alankaram talas: 4, 6, 7, 9, 10, 14).
  // Precompute the cumulative cell offset for each line so cellToGroup
  // lookups land on the correct global cell index.
  const lineOffsets = useMemo(() => {
    const offsets = []
    let cum = 0
    for (const line of pattern.lines) {
      offsets.push(cum)
      cum += line.length
    }
    return offsets
  }, [pattern])
  const barPositions = pattern.barPositions ?? DEFAULT_BAR_POSITIONS
  const totalSec = (notes.reduce((acc, n) => acc + n.durMs, 0) / 1000)

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          Varisai · Fundamental Exercises
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Abhyasa ganam — the daily drills. Pick any of the 72 melas and the patterns
          will sing in that raga's swarasthanas across all three kaalams.
        </p>
      </header>

      {/* Category sub-nav */}
      <nav className="flex flex-wrap gap-2 border-b border-gold/40 pb-3">
        {VARISAI_CATEGORIES.map((c) => {
          const isActive = c.id === category
          return (
            <button
              key={c.id}
              onClick={() => c.enabled && setCategory(c.id)}
              disabled={!c.enabled}
              className={
                'px-4 py-1.5 rounded-full text-sm font-semibold transition border-2 ' +
                (isActive
                  ? 'bg-crimson text-cream border-crimson shadow-temple'
                  : c.enabled
                    ? 'bg-cream border-gold/50 text-crimson hover:bg-gold/30'
                    : 'bg-cream-dark/60 border-gold/20 text-ink/35 cursor-not-allowed')
              }
              title={c.enabled ? '' : 'Coming soon'}
            >
              {c.label}{!c.enabled && <span className="ml-1 text-[10px] uppercase tracking-wider opacity-70">soon</span>}
            </button>
          )
        })}
      </nav>

      {/* Controls */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 md:p-5 paper space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Base Mela</label>
            <RagaSelector value={ragaNumber} onChange={setRagaNumber} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Kaalam</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {SPEEDS.map((s) => {
                const isActive = s.id === speed
                return (
                  <button
                    key={s.id}
                    onClick={() => setSpeed(s.id)}
                    className={
                      'px-3 py-1.5 text-xs font-semibold transition ' +
                      (isActive ? 'bg-crimson text-cream' : 'text-crimson hover:bg-gold/30')
                    }
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Shruti</label>
            <ShrutiSelector value={shrutiId} onChange={setShrutiId} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Repeat</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {[1, 2, 3].map((r) => {
                const isActive = r === repeat
                return (
                  <button
                    key={r}
                    onClick={() => setRepeat(r)}
                    className={
                      'px-3 py-1.5 text-xs font-semibold tabular-nums transition ' +
                      (isActive ? 'bg-crimson text-cream' : 'text-crimson hover:bg-gold/30')
                    }
                    title={r === 1 ? 'Play once' : `Play ${r} times`}
                  >
                    {r}×
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1 ml-auto">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Playback</label>
            <button
              onClick={handlePlay}
              className={
                'flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition shadow-temple ' +
                (playing
                  ? 'bg-crimson text-cream hover:bg-crimson-dark'
                  : 'bg-gold text-crimson-dark hover:bg-gold-dark hover:text-cream')
              }
            >
              {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playing ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>

        <SwaraLegend raga={raga} />
      </section>

      {/* Exercise tiles — adapts to category count (Sarali 14, Janta 12, Dhatu 2). */}
      <section className="flex flex-wrap gap-2">
        {patterns.map((p) => {
          const isSel = p.id === selectedPatternId
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPatternId(p.id)}
              className={
                'rounded-xl px-3 py-2 text-center border-2 transition flex-shrink-0 min-w-[5.5rem] ' +
                (isSel
                  ? 'bg-crimson text-cream border-crimson shadow-temple'
                  : 'bg-cream border-gold/50 text-crimson hover:bg-gold/20')
              }
              title={p.title}
            >
              <div className={'text-[9px] uppercase tracking-[0.18em] ' + (isSel ? 'text-gold' : 'text-saffron')}>
                {categoryObj.id === 'sarali' ? 'Sarali'
                  : categoryObj.id === 'janta' ? 'Janta'
                  : categoryObj.id === 'dhatu' ? 'Dhatu'
                  : categoryObj.id === 'alankaram' ? 'Alankaram'
                  : 'Pattern'}
              </div>
              <div className="font-display text-lg font-bold leading-none mt-0.5">#{p.id}</div>
            </button>
          )
        })}
      </section>

      {/* Notation panel */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            {categoryObj.id === 'alankaram' ? (
              // For Alankaram the tala name IS the identifier — promote it
              // to the display heading and demote the index to an eyebrow.
              <>
                <div className="text-xs uppercase tracking-[0.18em] text-saffron font-semibold">
                  {categoryObj.singular} · #{pattern.id}
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-crimson font-bold leading-tight mt-0.5">
                  {pattern.title}
                </h3>
                {pattern.laya && (
                  <p className="text-sm text-ink/60 font-mono mt-1.5">laya: {pattern.laya}</p>
                )}
              </>
            ) : (
              // Sarali / Janta / Dhatu — pattern numbers are the primary
              // identifier; the title is a short focus description.
              <>
                <h3 className="font-display text-2xl text-crimson font-bold">
                  {categoryObj.singular} #{pattern.id}
                </h3>
                <p className="text-xs text-ink/60 italic mt-0.5">{pattern.title}</p>
                {pattern.laya && (
                  <p className="text-[10px] text-ink/45 font-mono mt-0.5">laya: {pattern.laya}</p>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-ink/60 text-right">
            <div>
              in <span className={'text-crimson font-semibold ' + (isSa ? 'font-devanagari' : '')}>{t.govinda(raga.number)}</span>
              {' · '}
              {SPEEDS.find((s) => s.id === speed)?.label}
              {' · '}
              <span className="text-crimson font-semibold">{shruti.kattai} kattai</span>
              <span className="text-ink/50"> ({shruti.note}, {shruti.hz.toFixed(1)} Hz)</span>
            </div>
            <div className="text-ink/50">
              {(totalSec * repeat).toFixed(1)}s · ~{Math.round(noteMs)}ms / akshara
              {repeat > 1 && (
                <>
                  {' · '}
                  <span className={playing ? 'text-crimson font-semibold' : ''}>
                    iteration {playing ? activeRepeat + 1 : 1}/{repeat}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 overflow-x-auto pb-1">
          {pattern.lines.map((line, lineIdx) => (
            <PatternLine
              key={lineIdx}
              indices={line}
              lineOffset={lineOffsets[lineIdx]}
              cellToGroup={cellToGroup}
              activeGroup={activeGroup}
              barPositions={barPositions}
            />
          ))}
        </div>

        <div className="text-[10px] text-ink/50 italic pt-2 border-t border-gold/20">
          <span className="font-semibold text-ink/70">,</span> = kaarvai (sustain previous note) ·
          bar lines mark Adi tala laghu (4) and dhrutams (2 + 2)
        </div>
      </section>
    </div>
  )
}
