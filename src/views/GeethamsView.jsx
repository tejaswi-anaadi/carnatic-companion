import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Square, Search, ChevronDown, BookOpen, User, Music2, Drum } from 'lucide-react'
import { GEETHAMS } from '../lib/geethams.js'
import { SHRUTIS, DEFAULT_SHRUTI_ID, findShruti } from '../lib/shrutis.js'
import { SWARA_LABEL, SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'
import Piano from '../components/Piano.jsx'

const BASE_BPM = 72
const SPEEDS = [
  { id: 1, label: '1st Speed', mult: 1 },
  { id: 2, label: '2nd Speed', mult: 0.6 },
]

// Resolve a cell to a freq in Hz based on the chosen shruti.
function freqForCell(cell, baseHz) {
  if (cell.kaarvai) return null
  const semi = (SWARA_SEMITONE[cell.sw] ?? 0) + (cell.oct ?? 0) * 12
  return semitoneToFreq(semi, baseHz)
}

// Walk the geetham's cells, collapsing each sounded note + its trailing
// kaarvai cells into a single { freq, durMs, firstCellIdx } event for
// playback. Returns a parallel `cellToGroup[]` so each on-screen cell
// can light up when its sounded-note group is currently playing.
function buildSchedule(allCells, baseHz, slotMs) {
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
  return { events, cellToGroup }
}

function GeethamSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = GEETHAMS.find((g) => g.id === value) ?? GEETHAMS[0]
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GEETHAMS
    return GEETHAMS.filter((g) =>
      g.title.toLowerCase().includes(q) ||
      (g.altTitle ?? '').toLowerCase().includes(q) ||
      g.ragam.name.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div ref={ref} className="relative w-full sm:w-80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-saffron">{selected.ragam.name} · {selected.talam.name}</span>
          <span className="block truncate text-crimson font-display font-semibold">
            {selected.title}{selected.altTitle && <span className="text-ink/55 font-normal"> ({selected.altTitle})</span>}
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
              placeholder="Search geethams or ragas…"
              className="w-full bg-transparent text-sm focus:outline-none text-ink placeholder:text-ink/40"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {filtered.map((g) => {
              const isSel = g.id === value
              return (
                <li key={g.id}>
                  <button
                    onClick={() => { onChange(g.id); setOpen(false); setQuery('') }}
                    className={
                      'w-full text-left px-3 py-2 text-sm transition ' +
                      (isSel ? 'bg-gold text-crimson-dark font-semibold' : 'hover:bg-cream-dark text-ink')
                    }
                  >
                    <div className="font-display">{g.title}{g.altTitle && <span className="text-ink/55 font-normal"> · {g.altTitle}</span>}</div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-saffron">{g.ragam.name} · {g.talam.name}</div>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink/60 italic">No geethams match "{query}"</li>
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

// Pretty label for a swara letter — drops the suffix subscript on Sa/Pa
// since they have no variants.
function swaraDisplay(sw) {
  if (!sw) return ''
  return SWARA_LABEL[sw] ?? sw
}

// Render a swara with subscript — "M1" → "M₁", "D2" → "D₂", "S" → "S".
// Used inside the cell label so the swarasthana variant is unambiguous.
const SUB = { '1': '₁', '2': '₂', '3': '₃' }
function swaraShort(sw) {
  if (!sw) return ''
  if (sw === 'S' || sw === 'P' || sw === "S'") return sw
  return sw[0] + (SUB[sw[1]] ?? sw.slice(1))
}

// Convert a sounded-note (sw + oct) into the piano keyboard's "active swara"
// key. The keyboard spans madhya Sa to tara Sa (S → S'). For tara Sa we
// emit "S'"; otherwise the bare swara — the piano just lights up the
// matching madhya key for tara R/G/M/P/D/N (it can't render a second
// octave). Mandara uses the same mapping.
function pianoKey(sw, oct) {
  if (sw === 'S' && oct > 0) return "S'"
  return sw
}

// One cell of the geetham grid. Highlights when its sounded-note group is
// currently playing.
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
          {cell.ly || ' '}
        </span>
      </div>
      {showBigBarAfter && <span className="ml-1 w-0.5 bg-gold" aria-hidden="true" />}
      {showBarAfter && !showBigBarAfter && <span className="ml-1 w-px bg-gold/50" aria-hidden="true" />}
    </div>
  )
}

function GeethamLine({ cells, lineOffset, cellToGroup, activeGroup, barsAt, bigBarsAt }) {
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

export default function GeethamsView() {
  const audio = useAudioEngine()
  const [geethamId, setGeethamId] = useState(GEETHAMS[0].id)
  const [shrutiId, setShrutiId] = useState(DEFAULT_SHRUTI_ID)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [activeGroup, setActiveGroup] = useState(-1)
  const [activeFreq, setActiveFreq] = useState(null)
  const [activeSwara, setActiveSwara] = useState(null)

  const geetham = useMemo(() => GEETHAMS.find((g) => g.id === geethamId) ?? GEETHAMS[0], [geethamId])
  const shruti = findShruti(shrutiId)

  // Flatten all section lines into one continuous cell stream + per-line
  // offsets for highlight lookups.
  const { allCells, lineOffsets, sectionStartLines } = useMemo(() => {
    const all = []
    const offs = []          // per line: starting global cell index
    const sectStarts = []    // section index → starting line index
    let lineCount = 0
    for (const sec of geetham.sections) {
      sectStarts.push(lineCount)
      for (const ln of sec.lines) {
        offs.push(all.length)
        all.push(...ln)
        lineCount++
      }
    }
    return { allCells: all, lineOffsets: offs, sectionStartLines: sectStarts }
  }, [geetham])

  const slotMs = useMemo(() => {
    const beatMs = 60_000 / BASE_BPM
    const speedMult = SPEEDS.find((s) => s.id === speed)?.mult ?? 1
    // 1 cell = half an akshara at 2nd speed, full akshara at 1st speed
    return beatMs * speedMult
  }, [speed])

  const { events, cellToGroup } = useMemo(
    () => buildSchedule(allCells, shruti.hz, slotMs),
    [allCells, shruti.hz, slotMs]
  )

  // Stop on any change.
  useEffect(() => {
    audio.stop()
    setPlaying(false)
    setActiveGroup(-1)
    setActiveFreq(null)
    setActiveSwara(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geethamId, shrutiId, speed])

  const handlePlay = () => {
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

  const totalSec = events.reduce((acc, n) => acc + n.durMs, 0) / 1000

  // For the keyboard, derive ragaSwaras for shading: union of arohanam + avarohanam.
  const ragaSwaras = useMemo(() => {
    const set = new Set()
    for (const sw of geetham.ragam.aro) set.add(sw)
    for (const sw of geetham.ragam.ava) set.add(sw)
    // strip the "S'" tara suffix for piano shading (it operates on madhya only)
    return [...set].map((sw) => sw === "S'" ? 'S' : sw)
  }, [geetham])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          Geethams · First Songs
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          The simplest sung Carnatic forms — set lyrics on a fixed melody, sung in second
          speed at a steady tempo. Most are by Purandara Daasa, the Pitamaha of Carnatic music.
        </p>
      </header>

      {/* Controls */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 md:p-5 paper space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Geetham</label>
            <GeethamSelector value={geethamId} onChange={setGeethamId} />
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

        {/* Metadata strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-gold/30">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><User className="w-3 h-3" /> Composer</div>
            <div className="text-ink mt-0.5">{geetham.composer}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><Music2 className="w-3 h-3" /> Ragam</div>
            <div className="text-crimson font-semibold mt-0.5">{geetham.ragam.name}</div>
            {geetham.ragam.janyaOf && <div className="text-ink/55 text-[10px]">janya of {geetham.ragam.janyaOf}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><Drum className="w-3 h-3" /> Talam</div>
            <div className="text-crimson font-semibold mt-0.5">{geetham.talam.name}</div>
            <div className="text-ink/55 text-[10px]">{geetham.talam.jathi !== '—' && `${geetham.talam.jathi} jathi · `}{geetham.talam.aksharas} aksharas</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-saffron flex items-center gap-1"><BookOpen className="w-3 h-3" /> Language</div>
            <div className="text-ink mt-0.5">{geetham.language}</div>
          </div>
        </div>

        {/* Raga swarasthana legend */}
        <div className="rounded-xl bg-cream-dark border border-gold/40 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-saffron mb-1.5">Raga Swarasthanas</div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-baseline gap-1.5 text-xs">
              <span className="text-ink/55">Aro:</span>
              <span className="font-display text-ink">{geetham.ragam.aro.map(swaraDisplay).join(' ')}</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-xs">
              <span className="text-ink/55">Ava:</span>
              <span className="font-display text-ink">{geetham.ragam.ava.map(swaraDisplay).join(' ')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard visualizer */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-display text-lg text-crimson font-bold">Keyboard</h3>
          <div className="text-[10px] text-ink/55">in-raga keys shaded · active swara highlighted</div>
        </div>
        <Piano activeSwara={activeSwara} ragaSwaras={ragaSwaras} />
      </section>

      {/* Notation panel */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl md:text-3xl text-crimson font-bold leading-tight">
              {geetham.title}
              {geetham.altTitle && <span className="text-ink/55 text-lg font-normal italic ml-2">({geetham.altTitle})</span>}
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

        {geetham.meaning && (
          <div className="rounded-md bg-saffron/5 border-l-4 border-saffron px-4 py-2.5 text-sm text-ink/80 italic leading-relaxed">
            {geetham.meaning}
          </div>
        )}

        <div className="space-y-5 overflow-x-auto pb-1">
          {geetham.sections.map((sec, secIdx) => {
            const startingLineIdx = sectionStartLines[secIdx]
            return (
              <div key={secIdx}>
                <div className="text-xs uppercase tracking-[0.18em] text-saffron font-semibold mb-2">
                  {sec.label}
                </div>
                <div className="space-y-2.5">
                  {sec.lines.map((ln, lnIdx) => {
                    const lineIdxInFlat = startingLineIdx + lnIdx
                    const offset = lineOffsets[lineIdxInFlat]
                    return (
                      <GeethamLine
                        key={lnIdx}
                        cells={ln}
                        lineOffset={offset}
                        cellToGroup={cellToGroup}
                        activeGroup={activeGroup}
                        barsAt={geetham.barsAt ?? []}
                        bigBarsAt={geetham.bigBarsAt ?? []}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-[10px] text-ink/50 italic pt-2 border-t border-gold/20">
          <span className="font-semibold text-ink/70">,</span> = kaarvai (sustain previous note) ·
          {' '}<span className="text-saffron">•</span>X = mandara stayi · X<span className="text-saffron">•</span> would mean tara
          {' '}(top dot shown as <span className="text-saffron">•</span>X above swara letter) ·
          {' '}thin bar = anga boundary, thick bar = avarta boundary
        </div>
      </section>
    </div>
  )
}
