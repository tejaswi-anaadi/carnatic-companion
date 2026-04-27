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
