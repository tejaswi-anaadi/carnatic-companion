// Katapayadi Sankhya decoder for Melakartha raga names.
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

// Lookup table for the cheat sheet.
export const CHEAT_SHEET = [
  { row: '1 (ka)', items: ['k → 1', 'ṭ → 1', 'p → 1', 'y → 1'] },
  { row: '2 (kha)', items: ['kh → 2', 'ṭh → 2', 'ph → 2', 'r → 2'] },
  { row: '3 (ga)', items: ['g → 3', 'ḍ → 3', 'b → 3', 'l → 3'] },
  { row: '4 (gha)', items: ['gh → 4', 'ḍh → 4', 'bh → 4', 'v → 4'] },
  { row: '5 (nga)', items: ['m → 5', 'ś → 5'] },
  { row: '6 (cha)', items: ['c/ch → 6', 't → 6', 'ṣ → 6'] },
  { row: '7 (chha)', items: ['th → 7', 's → 7'] },
  { row: '8 (ja)', items: ['j → 8', 'd → 8', 'h → 8'] },
  { row: '9 (jha)', items: ['jh → 9', 'dh → 9'] },
  { row: '0 (nya/na)', items: ['ñ → 0', 'n → 0'] },
]
