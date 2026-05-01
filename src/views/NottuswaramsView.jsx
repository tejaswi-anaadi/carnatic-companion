import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Square, Search, ChevronDown, BookOpen, User, Drum, Info } from 'lucide-react'
import { NOTTUSWARAMS, NOTTUSWARAM_INTRO } from '../lib/nottuswarams.js'
import { SHRUTIS, DEFAULT_SHRUTI_ID, findShruti } from '../lib/shrutis.js'
import { SWARA_LABEL, SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import Piano from '../components/Piano.jsx'

const BASE_BPM = 72
const SPEEDS = [
  { id: 1, label: '1st Speed', mult: 1 },
  { id: 2, label: '2nd Speed', mult: 0.6 },
]

// Combined picker list — intro page first, then the compositions.
const ITEMS = [NOTTUSWARAM_INTRO, ...NOTTUSWARAMS]

function freqForCell(cell, baseHz) {
  if (cell.kaarvai) return null
  const semi = (SWARA_SEMITONE[cell.sw] ?? 0) + (cell.oct ?? 0) * 12
  return semitoneToFreq(semi, baseHz)
}

// Build the playback schedule. If `repeatFirstLines` is set, append a
// second pass over the cells of the first N visible lines after the
// main pass — those repeat events reuse their ORIGINAL gIdx so the
// notation grid lights up the same cells the second time around (the
// grid itself is rendered once, not duplicated).
function buildSchedule(allCells, baseHz, slotMs, repeatFirstLines = 0, lineOffsets = []) {
  const events = []
  const cellToGroup = []
  let current = null
  allCells.forEach((cell, cIdx) => {
    if (cell.kaarvai) {
      if (current) {
        current.durMs += slotMs
        cellToGroup.push(current.gIdx)
      } else {
        cellToGroup.push(-1)
      }
      return
    }
    const freq = freqForCell(cell, baseHz)
    const gIdx = events.length
    const ev = { gIdx, freq, durMs: slotMs, firstCellIdx: cIdx, swara: cell.sw, oct: cell.oct ?? 0 }
    events.push(ev)
    current = ev
    cellToGroup.push(gIdx)
  })

  if (repeatFirstLines > 0) {
    const repeatEnd = repeatFirstLines >= lineOffsets.length
      ? allCells.length
      : lineOffsets[repeatFirstLines]
    current = null
    for (let i = 0; i < repeatEnd; i++) {
      const cell = allCells[i]
      if (cell.kaarvai) {
        if (current) current.durMs += slotMs
        continue
      }
      const freq = freqForCell(cell, baseHz)
      const origGroup = cellToGroup[i]   // reuse original group for visual highlight
      const ev = { gIdx: origGroup, freq, durMs: slotMs, firstCellIdx: i, swara: cell.sw, oct: cell.oct ?? 0 }
      events.push(ev)
      current = ev
    }
  }

  return { events, cellToGroup }
}

function NottuswaramSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = ITEMS.find((n) => n.id === value) ?? ITEMS[0]
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ITEMS
    return ITEMS.filter((n) => n.title.toLowerCase().includes(q))
  }, [query])

  const subtitle = (n) =>
    n.isIntro ? 'History · Background' : `Sankarabharanam · ${n.talam.name}`

  return (
    <div ref={ref} className="relative w-full sm:w-96">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-saffron">{subtitle(selected)}</span>
          <span className="block truncate text-crimson font-display font-semibold">
            {selected.isIntro ? selected.title : `Note ${selected.number} · ${selected.title}`}
          </span>
        </span>
        <ChevronDown className={'w-4 h-4 text-crimson shrink-0 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-96 overflow-hidden rounded-lg border-2 border-gold bg-cream shadow-temple">
          <div className="flex items-center gap-2 px-2 py-2 border-b border-gold/40 bg-cream-dark">
            <Search className="w-4 h-4 text-crimson" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nottuswarams…"
              className="w-full bg-transparent text-sm focus:outline-none text-ink placeholder:text-ink/40"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {filtered.map((n) => {
              const isSel = n.id === value
              return (
                <li key={n.id}>
                  <button
                    onClick={() => { onChange(n.id); setOpen(false); setQuery('') }}
                    className={
                      'w-full text-left px-3 py-2 text-sm transition ' +
                      (isSel ? 'bg-gold text-crimson-dark font-semibold' : 'hover:bg-cream-dark text-ink')
                    }
                  >
                    <div className="font-display flex items-center gap-1.5">
                      {n.isIntro && <Info className="w-3.5 h-3.5 text-saffron" />}
                      {n.isIntro ? n.title : `Note ${n.number} · ${n.title}`}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-saffron">{subtitle(n)}</div>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink/60 italic">No nottuswarams match "{query}"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

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
                    <span><span className="font-semibold mr-1.5 inline-block w-6 tabular-nums">{s.kattai}</span><span className={isSel ? 'text-crimson-dark/80' : 'text-ink/60'}>{s.note}</span></span>
                    <span className={'text-[10px] tabular-nums ' + (isSel ? 'text-crimson-dark/70' : 'text-saffron')}>{s.hz.toFixed(1)} Hz</span>
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

function swaraDisplay(sw) {
  if (!sw) return ''
  return SWARA_LABEL[sw] ?? sw
}

const SUB = { '1': '₁', '2': '₂', '3': '₃' }
function swaraShort(sw) {
  if (!sw) return ''
  if (sw === 'S' || sw === 'P' || sw === "S'") return sw
  return sw[0] + (SUB[sw[1]] ?? sw.slice(1))
}

function pianoKey(sw, oct) {
  if (sw === 'S' && oct > 0) return "S'"
  return sw
}

function Cell({ cell, isActive, showBigBarAfter, showBarAfter }) {
  const bg = isActive
    ? 'bg-gold text-crimson-dark shadow-glow scale-105 font-bold'
    : cell.kaarvai
      ? 'bg-cream-dark/60 border border-gold/20 text-ink/40'
      : 'bg-cream border border-gold/30 text-ink'

  return (
    <div className={'flex items-stretch ' + (showBarAfter ? 'pr-1.5' : '') + (showBigBarAfter ? ' pr-2' : '')}>
      <div className="flex flex-col items-center min-w-[2.5rem] sm:min-w-[2.75rem]">
        <span className={'w-full text-center px-1 py-1 rounded-t-md text-sm font-display transition leading-tight ' + bg}>
          {cell.kaarvai ? (
            <span className="text-ink/50">,</span>
          ) : (
            <>
              {cell.oct > 0 && <span className="text-[9px] align-top text-saffron mr-0.5">•</span>}
              {swaraShort(cell.sw)}
              {cell.oct < 0 && <span className="text-[9px] align-bottom text-saffron ml-0.5">•</span>}
            </>
          )}
        </span>
        <span className={
          'w-full text-center px-1 py-0.5 text-[10px] sm:text-[11px] rounded-b-md leading-tight ' +
          (isActive ? 'bg-gold/60 text-crimson-dark font-semibold' : 'bg-cream-dark/50 text-ink/70')
        }>
          {cell.ly || ' '}
        </span>
      </div>
      {showBigBarAfter && <span className="ml-1 w-0.5 bg-gold" aria-hidden="true" />}
      {showBarAfter && !showBigBarAfter && <span className="ml-1 w-px bg-gold/50" aria-hidden="true" />}
    </div>
  )
}

function NottuswaramLine({ cells, lineOffset, cellToGroup, activeGroup, barsAt, bigBarsAt }) {
  return (
    <div className="flex flex-wrap gap-y-2 gap-x-0.5">
      {cells.map((cell, i) => {
        const globalIdx = lineOffset + i
        const group = cellToGroup[globalIdx]
        const isActive = activeGroup >= 0 && group === activeGroup
        const pos = i + 1
        const isBigBar = bigBarsAt.includes(pos) && pos !== cells.length
        const isBar = barsAt.includes(pos)
        return (
          <Cell
            key={i}
            cell={cell}
            isActive={isActive}
            showBarAfter={isBar}
            showBigBarAfter={isBigBar}
          />
        )
      })}
    </div>
  )
}

function IntroView() {
  const intro = NOTTUSWARAM_INTRO.history
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          Nottuswarams · Introduction
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          {intro.headline}
        </p>
      </header>

      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-7 paper space-y-6">
        {intro.sections.map((sec, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-display text-xl md:text-2xl text-crimson font-bold">{sec.heading}</h3>
            <p className="text-ink/85 leading-relaxed text-sm md:text-base">{sec.body}</p>
            {sec.note && (
              <p className="rounded-md bg-saffron/10 border-l-4 border-saffron px-3 py-2 text-xs md:text-sm text-ink/80 leading-relaxed">
                <span className="font-semibold text-crimson uppercase tracking-wider text-[10px] mr-1">Note ·</span>
                {sec.note}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-cream-dark border-2 border-gold shadow-temple p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-saffron mb-3">At a Glance</div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {intro.facts.map((f) => (
            <div key={f.label} className="flex flex-col">
              <dt className="text-[10px] uppercase tracking-[0.15em] text-ink/55">{f.label}</dt>
              <dd className="text-ink font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-xs text-ink/55 italic">
        Pick any nottuswaram from the dropdown above to see the notation, hear it played back at
        your chosen shruti, and watch the active swara light up on the keyboard.
      </p>
    </div>
  )
}

export default function NottuswaramsView() {
  const audio = useAudioEngine()
  const [selectedId, setSelectedId] = useState(NOTTUSWARAM_INTRO.id)
  const [shrutiId, setShrutiId] = useState(DEFAULT_SHRUTI_ID)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [activeGroup, setActiveGroup] = useState(-1)
  const [activeFreq, setActiveFreq] = useState(null)
  const [activeSwara, setActiveSwara] = useState(null)

  const item = useMemo(
    () => ITEMS.find((n) => n.id === selectedId) ?? ITEMS[0],
    [selectedId],
  )
  const isIntro = item.isIntro === true
  const shruti = findShruti(shrutiId)

  // Build flat cell stream for non-intro items.
  const { allCells, lineOffsets, sectionStartLines } = useMemo(() => {
    if (isIntro) return { allCells: [], lineOffsets: [], sectionStartLines: [] }
    const all = []
    const offs = []
    const sectStarts = []
    let lineCount = 0
    for (const sec of item.sections) {
      sectStarts.push(lineCount)
      for (const ln of sec.lines) {
        offs.push(all.length)
        all.push(...ln)
        lineCount++
      }
    }
    return { allCells: all, lineOffsets: offs, sectionStartLines: sectStarts }
  }, [item, isIntro])

  const slotMs = useMemo(() => {
    const beatMs = 60_000 / BASE_BPM
    const speedMult = SPEEDS.find((s) => s.id === speed)?.mult ?? 1
    // Nottuswarams are notated at 2 swaras per beat — each visible cell
    // lasts a half-akshara at base tempo, not a full akshara like in
    // Geethams. So slotMs is half a beat, then scaled by speed.
    return (beatMs / 2) * speedMult
  }, [speed])

  const { events, cellToGroup } = useMemo(
    () => buildSchedule(allCells, shruti.hz, slotMs, item.repeatFirstLines ?? 0, lineOffsets),
    [allCells, shruti.hz, slotMs, item, lineOffsets],
  )

  // Stop playback on any selection / config change.
  useEffect(() => {
    audio.stop()
    setPlaying(false)
    setActiveGroup(-1)
    setActiveFreq(null)
    setActiveSwara(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, shrutiId, speed])

  const handlePlay = () => {
    if (isIntro) return
    if (playing) {
      audio.stop()
      setPlaying(false)
      setActiveGroup(-1)
      setActiveFreq(null)
      setActiveSwara(null)
      return
    }
    setPlaying(true)
    setActiveGroup(-1)
    audio.playNotes(
      events,
      (n, _i) => {
        setActiveGroup(n.gIdx)
        setActiveFreq(n.freq)
        setActiveSwara(pianoKey(n.swara, n.oct))
      },
      () => { setPlaying(false); setActiveGroup(-1); setActiveFreq(null); setActiveSwara(null) },
    )
  }

  const totalSec = isIntro ? 0 : events.reduce((acc, n) => acc + n.durMs, 0) / 1000

  const ragaSwaras = useMemo(() => {
    if (isIntro) return []
    const set = new Set()
    for (const sw of item.ragam.aro) set.add(sw)
    for (const sw of item.ragam.ava) set.add(sw)
    return [...set].map((sw) => sw === "S'" ? 'S' : sw)
  }, [item, isIntro])

  return (
    <div className="space-y-6">
      {/* Header — only on the intro page; compositions get a tighter header below */}
      {!isIntro && (
        <header>
          <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
            Nottuswarams · Dikshitar's Western-Tune Songs
          </h2>
          <p className="text-ink/65 mt-1 text-sm md:text-base">
            Sankarabharanam compositions by Muthuswami Dikshitar — Western melodies set to
            Sanskrit lyrics, sung without gamakams. The simplest Dikshitar pieces a beginner can sing.
          </p>
        </header>
      )}

      {/* Picker — always shown */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 md:p-5 paper">
        <div className="flex flex-col gap-1 max-w-full">
          <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Select</label>
          <NottuswaramSelector value={selectedId} onChange={setSelectedId} />
        </div>
      </section>

      {isIntro ? (
        <IntroView />
      ) : (
        <>
          {/* Playback controls */}
          <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 md:p-5 paper space-y-4">
            <div className="flex flex-wrap items-end gap-4">
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

            {/* Metadata strip — no Ragam column (all are Sankarabharanam, shown below) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-gold/30">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><User className="w-3 h-3" /> Composer</div>
                <div className="text-ink mt-0.5">{item.composer}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><Drum className="w-3 h-3" /> Talam</div>
                <div className="text-crimson font-semibold mt-0.5">{item.talam.name}</div>
                <div className="text-ink/55 text-[10px]">{item.talam.jathi !== '—' && `${item.talam.jathi} jathi · `}{item.talam.aksharas} aksharas</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><BookOpen className="w-3 h-3" /> Language</div>
                <div className="text-ink mt-0.5">{item.language}</div>
              </div>
            </div>

            <div className="rounded-xl bg-cream-dark border border-gold/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-saffron mb-1.5">
                Sankarabharanam Swarasthanas
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-baseline gap-1.5 text-xs">
                  <span className="text-ink/55">Aro:</span>
                  <span className="font-display text-ink">{item.ragam.aro.map(swaraDisplay).join(' ')}</span>
                </div>
                <div className="flex items-baseline gap-1.5 text-xs">
                  <span className="text-ink/55">Ava:</span>
                  <span className="font-display text-ink">{item.ragam.ava.map(swaraDisplay).join(' ')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard */}
          <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-display text-lg text-crimson font-bold">Keyboard</h3>
              <div className="text-[10px] text-ink/55">in-raga keys shaded · active swara highlighted</div>
            </div>
            <Piano activeSwara={activeSwara} ragaSwaras={ragaSwaras} />
          </section>

          {/* Notation */}
          <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-saffron font-semibold">
                  Note {item.number}
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-crimson font-bold leading-tight">
                  {item.title}
                </h3>
              </div>
              <div className="text-xs text-ink/60 text-right tabular-nums">
                <div>{totalSec.toFixed(1)}s · ~{Math.round(slotMs)}ms / cell</div>
                <div className="text-ink/50">
                  <span className="text-crimson font-semibold">{shruti.kattai} kattai</span>
                  <span> · {shruti.note}, {shruti.hz.toFixed(1)} Hz</span>
                </div>
              </div>
            </div>

            {item.meaning && (
              <div className="rounded-md bg-saffron/5 border-l-4 border-saffron px-4 py-2.5 text-sm text-ink/80 italic leading-relaxed">
                {item.meaning}
              </div>
            )}

            {item.notes && (
              <div className="rounded-md bg-crimson/5 border-l-4 border-crimson px-4 py-2.5 text-sm text-ink/85 leading-relaxed">
                <span className="font-semibold text-crimson uppercase tracking-wider text-[10px] mr-1">Note ·</span>
                {item.notes}
              </div>
            )}

            <div className="space-y-5 overflow-x-auto pb-1">
              {item.sections.map((sec, secIdx) => {
                const startingLineIdx = sectionStartLines[secIdx]
                // Hide the bare "Geetham" header for nottuswarams — these
                // aren't geethams and the label is redundant. Real section
                // labels (Pallavi / Anupallavi / Charanam) still render.
                const showLabel = sec.label && sec.label !== 'Geetham'
                return (
                  <div key={secIdx}>
                    {showLabel && (
                      <div className="text-xs uppercase tracking-[0.18em] text-saffron font-semibold mb-2">
                        {sec.label}
                      </div>
                    )}
                    <div className="space-y-2.5">
                      {sec.lines.map((ln, lnIdx) => {
                        const lineIdxInFlat = startingLineIdx + lnIdx
                        const offset = lineOffsets[lineIdxInFlat]
                        return (
                          <NottuswaramLine
                            key={lnIdx}
                            cells={ln}
                            lineOffset={offset}
                            cellToGroup={cellToGroup}
                            activeGroup={activeGroup}
                            barsAt={item.barsAt ?? []}
                            bigBarsAt={item.bigBarsAt ?? []}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {item.repeatFirstLines > 0 && (
              <div className="text-xs text-saffron font-semibold italic">
                ↻ Repeat first {item.repeatFirstLines} lines (played automatically)
              </div>
            )}

            <div className="text-[10px] text-ink/50 italic pt-2 border-t border-gold/20">
              <span className="font-semibold text-ink/70">,</span> = kaarvai (sustain previous note) ·
              {' '}<span className="text-saffron">•</span>X = mandara stayi · X<span className="text-saffron">•</span> would mean tara
              {' '}(top dot shown as <span className="text-saffron">•</span>X above swara letter) ·
              {' '}thin bar = anga boundary, thick bar = avarta boundary
            </div>
          </section>
        </>
      )}
    </div>
  )
}
