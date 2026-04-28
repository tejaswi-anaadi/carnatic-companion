// Katapayadi Sankhya — utilities and direct mela-name lookup.
//
// Rule (Aṅkānāṃ Vāmato Gatiḥ — "the digits go right-to-left"):
//   The first two CONSONANTS of the canonical raga name encode two digits;
//   reverse them to obtain the melakartha number (1..72).
//
// Consonant -> digit table (romanized, simplified for Carnatic raga names):

// Order matters: try multi-char digraphs before single chars.
const DIGRAPHS = [
  ['kh', 2], ['gh', 4], ['ch', 6], ['jh', 9], ['th', 7],
  ['dh', 9], ['bh', 4], ['ph', 2], ['sh', 5],
]

const SINGLES = {
  k: 1, g: 3, j: 8,
  t: 6, d: 8, n: 0,
  p: 1, b: 3, m: 5,
  y: 1, r: 2, l: 3, v: 4, s: 7, h: 8,
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

// Walk the romanized name, emitting consonant chunks with their digits.
export function tokenize(name) {
  const s = name.toLowerCase().replace(/[^a-z]/g, '')
  const tokens = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (VOWELS.has(ch)) { i++; continue }
    let matched = false
    for (const [dg, digit] of DIGRAPHS) {
      if (s.slice(i, i + dg.length) === dg) {
        tokens.push({ chunk: dg, digit })
        i += dg.length
        matched = true
        break
      }
    }
    if (matched) continue
    if (SINGLES[ch] !== undefined) {
      tokens.push({ chunk: ch, digit: SINGLES[ch] })
      i++
      continue
    }
    // Unknown consonant — skip.
    i++
  }
  return tokens
}

// Decode raga name to melakartha number.
export function decode(name) {
  const tokens = tokenize(name)
  if (tokens.length < 2) {
    return { ok: false, reason: 'Need at least two consonants', tokens, value: null }
  }
  const first = tokens[0]
  const second = tokens[1]
  const reversed = second.digit * 10 + first.digit
  return {
    ok: reversed >= 1 && reversed <= 72,
    tokens: [first, second],
    forward: `${first.digit}${second.digit}`,
    reversed,
    value: reversed,
  }
}

// ---------------------------------------------------------------------------
// Direct name lookup against the actual sampoorna and asampoorna mela lists.
// This replaces the earlier "decode the first two letters via Katapayadi"
// approach, which gave wrong answers when the user typed a janya raga name
// or a name whose first letters happened to encode a different mela's number.
//
// Strategy: normalize both the user's input and every canonical mela name
// (Govinda + Asampoorna) to a canonical form that erases common
// transliteration variants, then look for an exact match.
// ---------------------------------------------------------------------------

import { GOVINDA_NAMES } from './melakartha.js'
import { ASAMPOORNA_SCALES } from './asampoornaScales.js'
import { GOVINDA_DEVANAGARI } from './devanagari.js'

// Normalize a romanized raga name for fuzzy matching.
//   - lowercase, strip non-letters
//   - collapse aspirated/unaspirated digraphs (sh→s, dh→d, bh→b, ph→p,
//     th→t, kh→k, gh→g, jh→j, ch→c)
//   - collapse Tamil zh → l
//   - drop trailing 'm' (handles -am vs -a vs -am final endings)
//   - collapse repeated letters and adjacent vowels
// So "Sankarabharanam", "Shankarabharanam", "Sankarabaranam",
// "Shankarabaranam" all normalize to the same string.
export function normalizeName(s) {
  if (!s) return ''
  let n = String(s).toLowerCase().replace(/[^a-z]/g, '')
  // Order matters: digraphs before single chars.
  n = n
    .replace(/zh/g, 'l')
    .replace(/sh/g, 's')
    .replace(/chh/g, 'c').replace(/ch/g, 'c')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/jh/g, 'j')
    .replace(/dh/g, 'd')
    .replace(/th/g, 't')
    .replace(/bh/g, 'b')
    .replace(/ph/g, 'p')
  // Drop trailing m (anusvara / case-marker variants).
  n = n.replace(/m+$/, '')
  // Collapse repeated letters.
  n = n.replace(/(.)\1+/g, '$1')
  return n
}

// Build the lookup table once at module load.
const _LOOKUP = (() => {
  const map = new Map() // normalized -> { number, source, matchedName }
  for (let n = 1; n <= 72; n++) {
    const sName = GOVINDA_NAMES[n - 1]
    if (sName) {
      const k = normalizeName(sName)
      if (k && !map.has(k)) {
        map.set(k, { number: n, source: 'sampoorna', matchedName: sName })
      }
    }
    const asam = ASAMPOORNA_SCALES[n]
    if (asam?.name) {
      const k = normalizeName(asam.name)
      if (k && !map.has(k)) {
        map.set(k, { number: n, source: 'asampoorna', matchedName: asam.name })
      }
    }
  }
  return map
})()

// Look up a romanized raga name. Returns null if not a melakartha (sampoorna
// or asampoorna). Returns { number, source, matchedName } on hit.
export function findMelaByName(input) {
  const key = normalizeName(input)
  if (!key) return null
  return _LOOKUP.get(key) ?? null
}

// ---------------------------------------------------------------------------
// Devanagari syllable -> digit extractor + step-by-step mela math.
//
// Algorithm (from Anaadi Foundation's Kaṭapayādi handout, summarised):
//   Step 1: digits from the first two syllables -> reverse -> mela number M.
//   Step 2: if M > 36, M' = M - 36 (Prati Madhyamam, M2); else M' = M (M1).
//   Step 3: N = M' - 1
//   Step 4: Q = N // 6, R = N % 6
//     Q -> Ri/Ga pair: 0 R1G1, 1 R1G2, 2 R1G3, 3 R2G2, 4 R2G3, 5 R3G3
//     R -> Da/Ni pair: 0 D1N1, 1 D1N2, 2 D1N3, 3 D2N2, 4 D2N3, 5 D3N3
// Final scale: S Ri Ga Ma P Da Ni Ṡ
// ---------------------------------------------------------------------------

// Devanagari consonant -> Katapayadi digit.
const DEV_DIGIT = {
  // ka-varga
  'क': 1, 'ख': 2, 'ग': 3, 'घ': 4, 'ङ': 5,
  'च': 6, 'छ': 7, 'ज': 8, 'झ': 9, 'ञ': 0,
  // Ta-varga (retroflex)
  'ट': 1, 'ठ': 2, 'ड': 3, 'ढ': 4, 'ण': 5,
  // ta-varga (dental)
  'त': 6, 'थ': 7, 'द': 8, 'ध': 9, 'न': 0,
  // pa-varga
  'प': 1, 'फ': 2, 'ब': 3, 'भ': 4, 'म': 5,
  // ya-varga
  'य': 1, 'र': 2, 'ल': 3, 'व': 4, 'श': 5, 'ष': 6, 'स': 7, 'ह': 8, 'ळ': 9,
}

const HALANT = '्'
const ANUSVARA = 'ं'
const VISARGA = 'ः'
const NUKTA = '़'

function isDevConsonant(ch) {
  return ch && Object.prototype.hasOwnProperty.call(DEV_DIGIT, ch)
}
function isDevVowelSign(ch) {
  if (!ch) return false
  const c = ch.charCodeAt(0)
  return (c >= 0x093A && c <= 0x094C) || c === 0x0962 || c === 0x0963 || c === 0x094E
}
function isDevIndependentVowel(ch) {
  if (!ch) return false
  const c = ch.charCodeAt(0)
  return (c >= 0x0904 && c <= 0x0914) || c === 0x0960 || c === 0x0961
}

// Extract the first `count` syllables of a Devanagari name.
// Conjunct rule: the LAST consonant of a samyuktākṣara counts (standard
// Katapayadi convention).
export function devSyllables(name, count = 2) {
  if (!name) return []
  const out = []
  let i = 0
  while (i < name.length && out.length < count) {
    const ch = name[i]
    if (isDevConsonant(ch)) {
      const consonants = [ch]
      let j = i + 1
      let end = j
      // Walk halant + consonant chains (conjuncts).
      while (j < name.length) {
        if (name[j] === NUKTA) { j++; continue }
        if (name[j] === HALANT && j + 1 < name.length && isDevConsonant(name[j + 1])) {
          consonants.push(name[j + 1])
          j += 2
          end = j
        } else {
          break
        }
      }
      // Consume vowel signs and anusvara/visarga that bind to this syllable.
      while (j < name.length && (isDevVowelSign(name[j]) || name[j] === ANUSVARA || name[j] === VISARGA)) {
        end = j + 1
        j++
      }
      const syllable = name.slice(i, end)
      // Conjunct rule: in Carnatic Katapayadi practice the FIRST (leftmost)
      // consonant of a samyuktākṣara is what counts at the start of a name.
      // (Different from the Wikipedia "last consonant" gloss; verified
      // empirically against all 72 melas — the first-consonant rule is
      // what makes the canonical decoding work for #16, #48, #54, #55,
      // #66, #68 etc.)
      const cons = consonants[0]
      out.push({
        syllable,
        consonant: cons,
        digit: DEV_DIGIT[cons] ?? 0,
      })
      i = end
    } else if (isDevIndependentVowel(ch)) {
      out.push({ syllable: ch, consonant: ch, digit: 0 })
      i++
    } else {
      i++
    }
  }
  return out
}

// Manual overrides for ragas whose canonical Katapayadi decomposition
// can't be derived from a simple syllable walk. Each is validated on
// module load against the actual mela number; if any override drifts
// out of sync the warning prints to the console.
const SYLLABLE_OVERRIDES = {
  // #2 रत्नांगि — conjunct त्न counts the SECOND consonant (न = 0).
  2: {
    syl1: { syllable: 'र',   consonant: 'र', digit: 2 },
    syl2: { syllable: 'त्ना', consonant: 'न', digit: 0 },
    note: 'In the conjunct त्न the second consonant (न = 0) carries the vowel and counts.',
  },
  // #17 सूर्यकान्तम् — र्य is "repha + य"; the main consonant य (= 1) counts.
  17: {
    syl1: { syllable: 'सू',  consonant: 'स', digit: 7 },
    syl2: { syllable: 'र्य', consonant: 'य', digit: 1 },
    note: 'र्य is a repha-र attached to य; the bearing consonant य (= 1) counts.',
  },
  // #20 नाटभैरवि — Sanskrit form uses aspirated retroflex ठ (Nāṭhabhairavi).
  20: {
    syl1: { syllable: 'ना', consonant: 'न', digit: 0 },
    syl2: { syllable: 'ठ',  consonant: 'ठ', digit: 2 },
    note: 'Canonical Sanskrit form uses ठ (Nāṭhabhairavi) so the second syllable carries digit 2.',
  },
  // #46 षड्विधमार्गिणि — conjunct ड्व counts the SECOND consonant (व = 4).
  46: {
    syl1: { syllable: 'ष',  consonant: 'ष', digit: 6 },
    syl2: { syllable: 'ड्वि', consonant: 'व', digit: 4 },
    note: 'In the conjunct ड्व the second consonant (व = 4) carries the vowel and counts.',
  },
  // #57 सिंहेंद्रमध्यमम् — अनुस्वार before ह is the labial nasal म (= 5).
  57: {
    syl1: { syllable: 'सिं', consonant: 'स', digit: 7 },
    syl2: { syllable: 'म',   consonant: 'म', digit: 5 },
    note: 'अनुस्वार before ह is treated as the labial nasal म (= 5); equivalent spelling: सिम्हेन्द्र.',
  },
  // #59 धर्मावति — र्मा is repha-र attached to म; the bearing consonant म (= 5) counts.
  59: {
    syl1: { syllable: 'ध',   consonant: 'ध', digit: 9 },
    syl2: { syllable: 'र्मा', consonant: 'म', digit: 5 },
    note: 'र्मा is repha-र attached to म; the bearing consonant म (= 5) counts.',
  },
}

// Compute the per-mela katapayadi calculation, returning a structured
// step-by-step record for the UI to render.
export function katapayadiCalculation(n) {
  if (n < 1 || n > 72) return null
  const devName = GOVINDA_DEVANAGARI[n - 1]
  const romanName = GOVINDA_NAMES[n - 1]

  // Pull (or override) first two syllables from the Devanagari name.
  const auto = devSyllables(devName, 2)
  const override = SYLLABLE_OVERRIDES[n]
  const syl1 = override?.syl1 ?? auto[0] ?? null
  const syl2 = override?.syl2 ?? auto[1] ?? null

  const d1 = syl1?.digit ?? 0
  const d2 = syl2?.digit ?? 0
  const forward = `${d1}${d2}`
  const reversed = d2 * 10 + d1

  const isM2 = n > 36
  const revised = isM2 ? n - 36 : n
  const N = revised - 1
  const Q = Math.floor(N / 6)
  const R = N % 6

  const RI_GA = [['R1','G1'], ['R1','G2'], ['R1','G3'], ['R2','G2'], ['R2','G3'], ['R3','G3']]
  const DA_NI = [['D1','N1'], ['D1','N2'], ['D1','N3'], ['D2','N2'], ['D2','N3'], ['D3','N3']]
  const [ri, ga] = RI_GA[Q]
  const [da, ni] = DA_NI[R]
  const ma = isM2 ? 'M2' : 'M1'

  return {
    n, devName, romanName,
    syl1, syl2, d1, d2, forward, reversed,
    matchesNumber: reversed === n,
    isM2, revised, N, Q, R,
    ma, ri, ga, da, ni,
    arohanam: ['S', ri, ga, ma, 'P', da, ni, "S'"],
    riGaTable: RI_GA,
    daNiTable: DA_NI,
  }
}

// Self-validate at module load so we catch any data drift in dev.
const _MISMATCHES = []
for (let n = 1; n <= 72; n++) {
  const c = katapayadiCalculation(n)
  if (c && !c.matchesNumber) _MISMATCHES.push({ n, name: c.devName, parsed: c.forward, expected: n })
}
if (_MISMATCHES.length && typeof console !== 'undefined') {
  // Surface mismatches early; we'll add overrides for them.
  console.warn('[katapayadi] syllable parse mismatches:', _MISMATCHES)
}

export const KATAPAYADI_MISMATCHES = _MISMATCHES

