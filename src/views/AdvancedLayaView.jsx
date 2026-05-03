import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Square, ChevronDown, Search, Gauge } from 'lucide-react'
import HandIcon from '../components/HandIcon.jsx'
import { FAMILIES, JATHIS, buildTala, flattenTalaBeats } from '../lib/talas.js'
import {
  VARISAI_CATEGORIES,
  RELATIVE_NOTE_LABELS,
  relativeNoteFor,
  getCategory,
} from '../lib/varisai.js'
import { RAGAS } from '../lib/melakartha.js'
import { SWARA_SEMITONE, semitoneToFreq } from '../lib/swaras.js'
import { SHRUTIS, DEFAULT_SHRUTI_ID, findShruti } from '../lib/shrutis.js'
import { useAudioEngine } from '../hooks/useAudioEngine.js'

// ---- Static config -------------------------------------------------------

const fam = (name) => FAMILIES.find((f) => f.name === name)
const jat = (name) => JATHIS.find((j) => j.name === name)

// A small, well-known curated list — full SST cross-product (35 talas) lives
// in the regular Talas view and would overwhelm this advanced practice screen.
const TALAM_PRESETS = [
  { id: 'adi',          label: 'Adi (Chatusra Triputa)', family: fam('Triputa'), jathi: jat('Chatusra') },
  { id: 'rupaka',       label: 'Rupaka (Chatusra)',      family: fam('Rupaka'),  jathi: jat('Chatusra') },
  { id: 'khanda-trip',  label: 'Khanda Triputa',         family: fam('Triputa'), jathi: jat('Khanda')   },
  { id: 'misra-trip',   label: 'Misra Triputa',          family: fam('Triputa'), jathi: jat('Misra')    },
  { id: 'tisra-trip',   label: 'Tisra Triputa',          family: fam('Triputa'), jathi: jat('Tisra')    },
  { id: 'eka-chatusra', label: 'Eka (Chatusra)',         family: fam('Eka'),     jathi: jat('Chatusra') },
  { id: 'jhampa',       label: 'Misra Jhampa',           family: fam('Jhampa'),  jathi: jat('Misra')    },
  { id: 'ata',          label: 'Khanda Ata',             family: fam('Ata'),     jathi: jat('Khanda')   },
]

const NADAI_OPTIONS = [
  { id: 3, label: 'Tisra (3)' },
  { id: 4, label: 'Chatusra (4)' },
  { id: 5, label: 'Khanda (5)' },
  { id: 7, label: 'Misra (7)' },
  { id: 9, label: 'Sankirna (9)' },
]

const KAALAM_OPTIONS = [
  { id: 1, label: '1×' },
  { id: 2, label: '2×' },
]

const REPEAT_OPTIONS = [
  { id: 1,      label: '1×' },
  { id: 2,      label: '2×' },
  { id: 3,      label: '3×' },
  { id: 'loop', label: '∞'  },
]

const VOICE_OPTIONS = [
  { id: 'kattai', label: 'Kattai' },
  { id: 'jalra',  label: 'Jalra'  },
  { id: 'beep',   label: 'Click'  },
  { id: 'off',    label: 'Off'    },
]

const DEFAULT_RAGA_NUMBER = 15 // Mayamalavagowla
const SWARA_VOL = 0.45

// ---- Schedule builder ----------------------------------------------------

function freqForIndex(arohanam, idx, baseHz) {
  const { pos, octaveShift } = relativeNoteFor(idx)
  const sw = arohanam[pos]
  const semi = (SWARA_SEMITONE[sw] ?? 0) + octaveShift * 12
  return semitoneToFreq(semi, baseHz)
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

// Number of avartanams (tala cycles) needed for the varisai to complete
// exactly on a tala boundary. The varisai must always finish at its
// avarohana — never get cut mid-phrase — so we extend the loop to the
// least common multiple of (varisai length) and (cells per avartanam).
//
// Example: Sarali #1 has 16 notes; Adi (8 beats) at Tisra nadai (3) gives
// 24 cells per avartanam. gcd(16, 24) = 8 → 2 avartanams = 48 cells = 3
// full varisais. The user explicitly called this case out.
function avartanamsNeeded(varisaiLength, cellsPerAvartanam) {
  if (varisaiLength <= 0 || cellsPerAvartanam <= 0) return 1
  return varisaiLength / gcd(varisaiLength, cellsPerAvartanam)
}

// Walk the full loop unit. Each cell is one swara slot of duration
// `noteDurationSec`. Kaarvai (null) cells inherit the previous freq but
// are flagged as non-onsets so the audio scheduler sustains the prior
// tone instead of re-attacking it. The loop spans `numAvartanams` tala
// cycles so the varisai always lands on its final avarohana note.
//
// We also synthesize a `landingCell` — the resolving samam (beat 0,
// slot 0, hand on Clap) that plays once at the very end of any finite
// repeat run. This guarantees the practice ends on samam regardless of
// nadai, kaalam, talam, or varisai length.
function buildCycleCells({ tala, varisai, raga, baseHz, totalPerBeat }) {
  const flat = varisai.lines.flat()
  const cellsPerAv = tala.totalBeats * totalPerBeat
  const numAvartanams = avartanamsNeeded(flat.length, cellsPerAv)
  const totalCells = numAvartanams * cellsPerAv
  const cells = []
  let lastFreq = null
  let lastIdx = null
  for (let i = 0; i < totalCells; i++) {
    const idx = flat[i % flat.length]
    const avartanamIdx = Math.floor(i / cellsPerAv)
    const beatIdx = Math.floor((i % cellsPerAv) / totalPerBeat)
    const slotInBeat = i % totalPerBeat
    if (idx == null) {
      cells.push({ avartanamIdx, beatIdx, slotInBeat, isOnset: false, freq: lastFreq, idx: lastIdx })
    } else {
      const freq = freqForIndex(raga.arohanam, idx, baseHz)
      lastFreq = freq
      lastIdx = idx
      cells.push({ avartanamIdx, beatIdx, slotInBeat, isOnset: true, freq, idx })
    }
  }
  // The resolving samam clap. flat[0] is the varisai's first sounded note
  // — for any traditional varisai that is the tonic Sa, which IS the
  // landing pitch on samam. Skip leading kaarvais just in case.
  let landingIdx = 0
  for (const v of flat) { if (v != null) { landingIdx = v; break } }
  const landingCell = {
    avartanamIdx: numAvartanams, // one past the final cycle
    beatIdx: 0,
    slotInBeat: 0,
    isOnset: true,
    freq: freqForIndex(raga.arohanam, landingIdx, baseHz),
    idx: landingIdx,
    isLanding: true,
  }
  return { cells, numAvartanams, cellsPerAv, landingCell }
}

function chunkByBeat(cells, totalBeats, totalPerBeat) {
  return Array.from({ length: totalBeats }, (_, b) =>
    cells.slice(b * totalPerBeat, (b + 1) * totalPerBeat)
  )
}

// ---- Compact selectors (slim local copies; not worth extracting yet) -----

function Pill({ active, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 text-xs font-semibold transition ' +
        (active ? 'bg-crimson text-cream' : 'text-crimson hover:bg-gold/30') +
        ' ' + className
      }
    >
      {children}
    </button>
  )
}

function Dropdown({ value, onChange, options, label, getKey, getLabel, getEyebrow, width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const selected = options.find((o) => getKey(o) === value) ?? options[0]
  return (
    <div ref={ref} className={'relative ' + width}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition text-left"
      >
        <span className="min-w-0">
          {getEyebrow && (
            <span className="block text-[10px] uppercase tracking-[0.18em] text-saffron">
              {getEyebrow(selected)}
            </span>
          )}
          <span className="block truncate text-crimson font-semibold font-display">
            {getLabel(selected)}
          </span>
        </span>
        <ChevronDown className={'w-4 h-4 text-crimson shrink-0 transition ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border-2 border-gold bg-cream shadow-temple">
          <ul>
            {options.map((o) => {
              const k = getKey(o)
              const isSel = k === value
              return (
                <li key={k}>
                  <button
                    onClick={() => { onChange(k); setOpen(false) }}
                    className={
                      'w-full text-left px-3 py-1.5 text-sm transition ' +
                      (isSel ? 'bg-gold text-crimson-dark font-semibold' : 'hover:bg-cream-dark text-ink')
                    }
                  >
                    {getEyebrow && (
                      <span className="block text-[9px] uppercase tracking-[0.18em] text-saffron/90">
                        {getEyebrow(o)}
                      </span>
                    )}
                    <span className="block">{getLabel(o)}</span>
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

function RagaPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
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
      String(r.number).includes(q)
    )
  }, [query])
  return (
    <div ref={ref} className="relative w-60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-gold bg-cream hover:bg-cream-dark transition text-left"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-saffron">Mela #{selected.number}</span>
          <span className="block truncate text-crimson font-semibold font-display">{selected.name}</span>
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
                    <span className="text-[10px] tabular-nums text-saffron w-7 shrink-0">#{r.number}</span>
                    <span className="truncate">{r.name}</span>
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

// ---- Hand metronome pane -------------------------------------------------

function HandPane({ tala, beatIdx, isRunning, totalPerBeat, slotInBeat, nadai, kaalam }) {
  const beats = useMemo(() => flattenTalaBeats(tala), [tala])
  const current = beats[beatIdx] ?? beats[0]
  const angas = tala.angas
  return (
    <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 paper flex flex-col items-center gap-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-saffron">Tala Hand</div>
      <div className={'transition-transform ' + (isRunning ? 'scale-105' : 'scale-100')}>
        <HandIcon action={current.action} active={isRunning} size={140} />
      </div>
      <div className="text-center">
        <div className="font-display text-2xl text-crimson font-bold leading-tight">
          {current.label}
        </div>
        <div className="text-xs text-ink/60 tabular-nums">
          Beat {beatIdx + 1} / {tala.totalBeats}
        </div>
      </div>

      {/* Anga ring — one dot per beat, grouped by anga with a gap between them */}
      <div className="flex flex-wrap gap-2 justify-center">
        {angas.map((anga, ai) => {
          const startBeat = angas.slice(0, ai).reduce((s, a) => s + a.beats, 0)
          return (
            <div key={ai} className="flex gap-1 items-center">
              {anga.actions.map((_a, bi) => {
                const globalBeat = startBeat + bi
                const isActive = isRunning && globalBeat === beatIdx
                return (
                  <span
                    key={bi}
                    className={
                      'w-2.5 h-2.5 rounded-full transition ' +
                      (isActive
                        ? 'bg-crimson ring-2 ring-saffron/60 scale-125'
                        : 'bg-gold/40')
                    }
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Nadai sub-pulse strip — purely visual hint of where we are inside the beat */}
      <div className="w-full">
        <div className="text-[9px] uppercase tracking-[0.18em] text-saffron mb-1.5 text-center">
          Nadai · {nadai} {kaalam > 1 ? `× ${kaalam}` : ''} = {totalPerBeat} per beat
        </div>
        <div className="flex justify-center gap-0.5">
          {Array.from({ length: totalPerBeat }, (_, i) => {
            const isActive = isRunning && i === slotInBeat
            const isGroupStart = i % nadai === 0
            return (
              <span
                key={i}
                className={
                  'h-2 rounded-sm transition ' +
                  (isActive ? 'bg-crimson w-3' : isGroupStart ? 'bg-saffron/70 w-1.5' : 'bg-gold/40 w-1.5')
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---- Beat boxes (right pane) --------------------------------------------

function SwaraCell({ cell, isActive }) {
  const note = cell.idx == null ? null : relativeNoteFor(cell.idx)
  const isSustain = !cell.isOnset
  return (
    <span
      className={
        'min-w-[2rem] text-center px-1 py-1.5 rounded-md text-sm font-display transition ' +
        (isActive
          ? 'bg-gold text-crimson-dark shadow-glow scale-110 font-bold'
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
  )
}

function BeatBox({ beatIdx, action, label, cells, isActive, activeSlot, nadai, kaalam }) {
  // Group cells into Kaalam buckets of `nadai` each, so 5×2 reads as 5 | 5
  const groups = []
  for (let k = 0; k < kaalam; k++) {
    groups.push(cells.slice(k * nadai, (k + 1) * nadai))
  }
  return (
    <div
      className={
        'rounded-xl border-2 px-3 py-2.5 transition flex flex-col gap-1.5 ' +
        (isActive
          ? 'border-crimson bg-cream shadow-temple ring-2 ring-saffron/40'
          : 'border-gold/50 bg-cream')
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-saffron font-semibold">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-ink/55">Beat {beatIdx + 1}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {groups.map((g, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {g.map((cell, ci) => {
              const slotInBeat = gi * nadai + ci
              return (
                <SwaraCell key={ci} cell={cell} isActive={isActive && activeSlot === slotInBeat} />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Main view -----------------------------------------------------------

export default function AdvancedLayaView() {
  const audio = useAudioEngine()

  const [talamId, setTalamId] = useState('adi')
  const [category, setCategory] = useState('sarali')
  const [varisaiId, setVarisaiId] = useState(1)
  const [ragaNumber, setRagaNumber] = useState(DEFAULT_RAGA_NUMBER)
  const [shrutiId, setShrutiId] = useState(DEFAULT_SHRUTI_ID)
  const [nadai, setNadai] = useState(4)
  const [kaalam, setKaalam] = useState(1)
  const [bpm, setBpm] = useState(72)
  const [repeat, setRepeat] = useState(1) // 1, 2, 3, or 'loop'
  const [talaVoice, setTalaVoice] = useState('kattai') // 'kattai' | 'jalra' | 'beep' | 'off'

  const preset = TALAM_PRESETS.find((p) => p.id === talamId) ?? TALAM_PRESETS[0]
  const tala = useMemo(() => buildTala(preset.family, preset.jathi), [preset])
  const flatBeats = useMemo(() => flattenTalaBeats(tala), [tala])
  const raga = RAGAS[ragaNumber - 1]
  const shruti = findShruti(shrutiId)

  const categoryObj = getCategory(category)
  const patterns = categoryObj.patterns
  const varisai = useMemo(
    () => patterns.find((p) => p.id === varisaiId) ?? patterns[0],
    [patterns, varisaiId]
  )

  const totalPerBeat = nadai * kaalam
  const beatDurationSec = 60 / bpm
  const noteDurationSec = beatDurationSec / totalPerBeat

  const { cells: cycleCells, numAvartanams, cellsPerAv, landingCell } = useMemo(
    () => buildCycleCells({ tala, varisai, raga, baseHz: shruti.hz, totalPerBeat }),
    [tala, varisai, raga, shruti.hz, totalPerBeat]
  )

  // Playback state
  const [isRunning, setIsRunning] = useState(false)
  const [pos, setPos] = useState({
    cellIdx: -1,
    beatIdx: 0,
    slotInBeat: 0,
    avartanamIdx: 0,
    isLandingSamam: false,
  })

  // Beat boxes always show ONE avartanam at a time — the cells inside
  // change as the varisai progresses across multiple cycles. When stopped,
  // show the first avartanam.
  const visibleAvartanam = pos.avartanamIdx
  const beatChunks = useMemo(() => {
    const offset = visibleAvartanam * cellsPerAv
    const slice = cycleCells.slice(offset, offset + cellsPerAv)
    return chunkByBeat(slice, tala.totalBeats, totalPerBeat)
  }, [cycleCells, visibleAvartanam, cellsPerAv, tala.totalBeats, totalPerBeat])

  // Refs that the scheduler reads on every tick
  const counterRef = useRef(0)         // wraps within cycleCells.length
  const globalCounterRef = useRef(0)   // never wraps — counts every cell played
  const stopAtRef = useRef(Infinity)   // global counter limit (Infinity = loop forever)
  const loopCellsRef = useRef(0)       // total non-landing cells in the run
  const nextNoteTimeRef = useRef(0)
  const cellsRef = useRef(cycleCells)
  const landingCellRef = useRef(landingCell)
  const noteDurRef = useRef(noteDurationSec)
  const flatBeatsRef = useRef(flatBeats)
  const talaVoiceRef = useRef(talaVoice)
  const sourcesRef = useRef([])
  const visualTimersRef = useRef([])
  const naturalStopTimerRef = useRef(null)

  // Stop on any control change. Audio is recreated cleanly on next Play.
  useEffect(() => {
    stopInternal()
    setPos({ cellIdx: -1, beatIdx: 0, slotInBeat: 0, avartanamIdx: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talamId, category, varisaiId, ragaNumber, shrutiId, nadai, kaalam, bpm, repeat])

  // Tala-voice changes don't need a full restart — just sync the ref so
  // the next scheduled beat picks the new timbre.
  useEffect(() => { talaVoiceRef.current = talaVoice }, [talaVoice])
  useEffect(() => { flatBeatsRef.current = flatBeats }, [flatBeats])

  // Keep latest values visible to the running scheduler. Note that we
  // intentionally STOP on bpm/nadai/kaalam changes above, so this is
  // mostly a belt-and-braces sync — the scheduler always re-reads from
  // these refs at every tick.
  useEffect(() => { cellsRef.current = cycleCells }, [cycleCells])
  useEffect(() => { landingCellRef.current = landingCell }, [landingCell])
  useEffect(() => { noteDurRef.current = noteDurationSec }, [noteDurationSec])

  function killAllSources() {
    const ctx = audio.getCtx()
    const now = ctx.currentTime
    for (const h of sourcesRef.current) {
      if (!h?.osc) continue
      if (h.scheduledEnd != null && h.scheduledEnd <= now) continue
      try {
        h.gain.gain.cancelScheduledValues(now)
        h.gain.gain.setValueAtTime(h.gain.gain.value, now)
        h.gain.gain.linearRampToValueAtTime(0.0001, now + 0.015)
        h.osc.stop(now + 0.025)
      } catch (_e) { /* already stopped */ }
    }
    sourcesRef.current = []
  }

  function stopInternal() {
    setIsRunning(false)
    killAllSources()
    visualTimersRef.current.forEach(clearTimeout)
    visualTimersRef.current = []
    if (naturalStopTimerRef.current) {
      clearTimeout(naturalStopTimerRef.current)
      naturalStopTimerRef.current = null
    }
  }

  async function start() {
    if (isRunning) { stopInternal(); return }
    const ctx = await audio.ensureRunning()
    if (naturalStopTimerRef.current) {
      clearTimeout(naturalStopTimerRef.current)
      naturalStopTimerRef.current = null
    }
    setPos({ cellIdx: -1, beatIdx: 0, slotInBeat: 0, avartanamIdx: 0, isLandingSamam: false })
    counterRef.current = 0
    globalCounterRef.current = 0
    // Finite runs play `repeat` full loops + ONE landing cell on samam.
    // Infinite/loop mode skips the landing and just keeps cycling.
    loopCellsRef.current = repeat === 'loop' ? Infinity : repeat * cycleCells.length
    stopAtRef.current = repeat === 'loop' ? Infinity : loopCellsRef.current + 1
    nextNoteTimeRef.current = ctx.currentTime + 0.08
    setIsRunning(true)
  }

  // Lookahead scheduler — mirrors useMetronome's pattern.
  useEffect(() => {
    if (!isRunning) return
    const ctx = audio.getCtx()
    const lookahead = 0.1
    const tick = () => {
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {})
        nextNoteTimeRef.current = ctx.currentTime + 0.08
        return
      }
      const sec = ctx.currentTime
      // Prune finished sources.
      sourcesRef.current = sourcesRef.current.filter((h) => h && h.scheduledEnd > sec)
      if (nextNoteTimeRef.current < sec - 0.5) {
        nextNoteTimeRef.current = sec + 0.05
      }
      const cells = cellsRef.current
      const landing = landingCellRef.current
      const noteDur = noteDurRef.current
      const loopCells = loopCellsRef.current
      while (nextNoteTimeRef.current < sec + lookahead) {
        const g = globalCounterRef.current
        if (g >= stopAtRef.current) break
        const isLanding = g >= loopCells
        const i = isLanding ? -1 : g % cells.length
        const cell = isLanding ? landing : cells[i]
        if (!cell) break
        // Audio onset. For non-landing cells, sustain extends through any
        // trailing kaarvai cells in the same cycle. The landing samam is a
        // one-shot single-slot tone.
        if (cell.isOnset && Number.isFinite(cell.freq) && cell.freq > 0) {
          let len = 1
          if (!isLanding) {
            for (let j = i + 1; j < cells.length && !cells[j].isOnset; j++) len++
          }
          const sustainSec = Math.max(0.04, len * noteDur * 0.94)
          const handle = audio.scheduleTone(
            nextNoteTimeRef.current,
            cell.freq,
            sustainSec,
            'triangle',
            SWARA_VOL,
          )
          if (handle) sourcesRef.current.push(handle)
        }
        // Tala stroke — fires once per beat (slot 0 of each beat). The
        // landing cell IS slot 0 / beat 0 / 'clap', so it gets a final
        // samam stroke for free, matching the resolving samam contract.
        // We only schedule on beat boundaries here — sub-pulse ticks
        // would clash with the swaras, which already mark every nadai
        // subdivision.
        if (cell.slotInBeat === 0) {
          const beat = flatBeatsRef.current[cell.beatIdx] ?? flatBeatsRef.current[0]
          const role = beat.action === 'clap' ? 'main' : 'sub-main'
          const v = talaVoiceRef.current
          if (v === 'kattai') {
            sourcesRef.current.push(...audio.scheduleKattai(nextNoteTimeRef.current, role))
          } else if (v === 'jalra') {
            sourcesRef.current.push(...audio.scheduleJalra(nextNoteTimeRef.current, role))
          } else if (v === 'beep') {
            const h = audio.scheduleClick(nextNoteTimeRef.current, beat.action)
            if (h) sourcesRef.current.push(h)
          }
          // 'off' → silent, hand pane still shows the beat
        }
        // Visual position update aligned to the audio onset. The landing
        // wraps the avartanam counter back to 0 (== samam of "next" cycle)
        // and flags isLandingSamam so the badge can adjust.
        const visualDelay = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
        const snap = isLanding
          ? { cellIdx: -1, beatIdx: 0, slotInBeat: 0, avartanamIdx: 0, isLandingSamam: true }
          : {
              cellIdx: i,
              beatIdx: cell.beatIdx,
              slotInBeat: cell.slotInBeat,
              avartanamIdx: cell.avartanamIdx,
              isLandingSamam: false,
            }
        const t = setTimeout(() => setPos(snap), visualDelay)
        visualTimersRef.current.push(t)

        globalCounterRef.current = g + 1
        counterRef.current = (g + 1) % cells.length
        nextNoteTimeRef.current += noteDur
      }
      // Once the final cell of a finite run has been scheduled, arm a
      // one-shot natural stop. We let the audio ring out naturally — no
      // killAllSources here, just flip isRunning so the tick loop ends and
      // highlights freeze when the music actually finishes.
      if (
        stopAtRef.current !== Infinity &&
        globalCounterRef.current >= stopAtRef.current &&
        !naturalStopTimerRef.current
      ) {
        const stopTime = nextNoteTimeRef.current + 0.05
        const delayMs = Math.max(0, (stopTime - ctx.currentTime) * 1000)
        naturalStopTimerRef.current = setTimeout(() => {
          setIsRunning(false)
          naturalStopTimerRef.current = null
        }, delayMs)
      }
    }
    const id = setInterval(tick, 25)
    return () => clearInterval(id)
  }, [isRunning, audio])

  useEffect(() => () => stopInternal(), []) // unmount cleanup

  const currentBeat = flatBeats[pos.beatIdx] ?? flatBeats[0]
  const avartanamSec = cellsPerAv * noteDurationSec
  const loopSec = cycleCells.length * noteDurationSec

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-saffron text-[10px] uppercase tracking-[0.18em]">
          <Gauge className="w-3.5 h-3.5" />
          <span>Advanced Practice</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold mt-1">
          Advanced Laya — Varisai × Tala
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Run any varisai inside any talam, then dial Nadai and Kaalam independently.
          The hand keeps the macro pulse; the right pane shows the sub-grid.
        </p>
      </header>

      {/* Top control bar */}
      <section className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-4 md:p-5 paper space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Talam</label>
            <Dropdown
              value={talamId}
              onChange={setTalamId}
              options={TALAM_PRESETS}
              getKey={(o) => o.id}
              getLabel={(o) => o.label}
              getEyebrow={(o) => `${o.family.template.join(' ')} · ${o.jathi.beats}-jathi`}
              width="w-60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Varisai</label>
            <div className="flex gap-2">
              <Dropdown
                value={category}
                onChange={(c) => { setCategory(c); setVarisaiId(1) }}
                options={VARISAI_CATEGORIES.filter((c) => c.enabled)}
                getKey={(o) => o.id}
                getLabel={(o) => o.label}
                width="w-44"
              />
              <Dropdown
                value={varisaiId}
                onChange={setVarisaiId}
                options={categoryObj.patterns}
                getKey={(o) => o.id}
                getLabel={(o) => `#${o.id} · ${o.title}`}
                width="w-64"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Mela Raga</label>
            <RagaPicker value={ragaNumber} onChange={setRagaNumber} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Shruti</label>
            <Dropdown
              value={shrutiId}
              onChange={setShrutiId}
              options={SHRUTIS}
              getKey={(o) => o.id}
              getLabel={(o) => `${o.kattai} · ${o.note}`}
              getEyebrow={(o) => `${o.hz.toFixed(1)} Hz`}
              width="w-32"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 border-t border-gold/30 pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Nadai</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {NADAI_OPTIONS.map((n) => (
                <Pill key={n.id} active={n.id === nadai} onClick={() => setNadai(n.id)}>
                  {n.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Kaalam</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {KAALAM_OPTIONS.map((k) => (
                <Pill key={k.id} active={k.id === kaalam} onClick={() => setKaalam(k.id)}>
                  {k.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Repeat</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {REPEAT_OPTIONS.map((r) => (
                <Pill
                  key={r.id}
                  active={r.id === repeat}
                  onClick={() => setRepeat(r.id)}
                  className="min-w-[2.25rem]"
                >
                  {r.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Tala Sound</label>
            <div className="inline-flex rounded-full border-2 border-gold overflow-hidden bg-cream-dark">
              {VOICE_OPTIONS.map((v) => (
                <Pill key={v.id} active={v.id === talaVoice} onClick={() => setTalaVoice(v.id)}>
                  {v.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[14rem]">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">
              BPM · {bpm}
            </label>
            <input
              type="range"
              min={30}
              max={180}
              step={1}
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              className="w-full accent-crimson"
            />
            <div className="text-[10px] text-ink/55 tabular-nums">
              beat {(beatDurationSec * 1000).toFixed(0)}ms · note {(noteDurationSec * 1000).toFixed(0)}ms · avartanam {avartanamSec.toFixed(2)}s
              {numAvartanams > 1 && <> · loop {loopSec.toFixed(2)}s</>}
              {repeat !== 'loop' && repeat > 1 && <> · {repeat}× ⇒ {(loopSec * repeat).toFixed(1)}s</>}
              {repeat === 'loop' && <> · loops continuously</>}
            </div>
          </div>

          <div className="flex flex-col gap-1 ml-auto">
            <label className="text-[10px] uppercase tracking-[0.18em] text-saffron">Playback</label>
            <button
              onClick={start}
              className={
                'flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition shadow-temple ' +
                (isRunning
                  ? 'bg-crimson text-cream hover:bg-crimson-dark'
                  : 'bg-gold text-crimson-dark hover:bg-gold-dark hover:text-cream')
              }
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>
      </section>

      {/* Split pane */}
      <section className="grid lg:grid-cols-[300px_1fr] gap-6">
        <HandPane
          tala={tala}
          beatIdx={pos.beatIdx}
          isRunning={isRunning}
          totalPerBeat={totalPerBeat}
          slotInBeat={pos.slotInBeat}
          nadai={nadai}
          kaalam={kaalam}
        />

        <div className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 paper space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-2xl text-crimson font-bold leading-tight">
                {tala.family} · {tala.jathi}
                <span className="text-ink/55 font-normal text-base ml-2">
                  ({tala.totalBeats} beats)
                </span>
              </h3>
              <p className="text-xs text-ink/60">
                {categoryObj.singular} #{varisai.id} · {varisai.title} ·{' '}
                <span className="text-crimson font-semibold">{raga.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(numAvartanams > 1 || pos.isLandingSamam) && (
                <div
                  className={
                    'rounded-lg border-2 px-3 py-1.5 text-center transition ' +
                    (pos.isLandingSamam
                      ? 'border-crimson bg-gold/30 shadow-glow'
                      : 'border-gold bg-cream-dark')
                  }
                >
                  <div className="text-[9px] uppercase tracking-[0.18em] text-saffron">
                    {pos.isLandingSamam ? 'Samam ✓' : 'Avartanam'}
                  </div>
                  <div className="font-display text-lg text-crimson font-bold tabular-nums leading-none mt-0.5">
                    {pos.isLandingSamam
                      ? <span className="text-base">landed</span>
                      : <>{pos.avartanamIdx + 1}<span className="text-ink/40 font-normal"> / {numAvartanams}</span></>}
                  </div>
                </div>
              )}
              <div className="text-[10px] text-ink/55 text-right tabular-nums">
                {totalPerBeat} swaras / beat × {tala.totalBeats} = {cellsPerAv} per avartanam
                <div>
                  Varisai = {varisai.lines.flat().length} notes ·{' '}
                  <span className={numAvartanams > 1 ? 'text-crimson font-semibold' : ''}>
                    needs {numAvartanams} avartanam{numAvartanams === 1 ? '' : 's'}
                  </span>{' '}
                  to complete ({cycleCells.length / varisai.lines.flat().length}× through)
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {tala.angas.map((anga, ai) => {
              const startBeat = tala.angas.slice(0, ai).reduce((s, a) => s + a.beats, 0)
              return (
                <div key={ai} className="flex flex-wrap gap-2 items-stretch">
                  {anga.actions.map((act, bi) => {
                    const beatIdx = startBeat + bi
                    const isActive = isRunning && beatIdx === pos.beatIdx
                    return (
                      <BeatBox
                        key={bi}
                        beatIdx={beatIdx}
                        action={act.action}
                        label={act.label}
                        cells={beatChunks[beatIdx] ?? []}
                        isActive={isActive}
                        activeSlot={pos.slotInBeat}
                        nadai={nadai}
                        kaalam={kaalam}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className="text-[10px] text-ink/50 italic pt-2 border-t border-gold/20">
            <span className="font-semibold text-ink/70">,</span> = kaarvai (sustain previous note) ·
            each row is one anga (laghu / drutam / anudrutam) ·
            within a beat, vertical gold dividers separate Kaalam buckets when {kaalam}× &gt; 1
          </div>
        </div>
      </section>
    </div>
  )
}
