// Geethams — the simplest sung Carnatic forms, traditionally taught right
// after the Sarali / Janta / Alankaram drills. Each piece pairs a fixed
// melody with devotional lyrics (Sahitya), giving students their first
// taste of singing actual words to a raga's swarasthanas.
//
// Notation source: Shivkumar Kalyanaraman's Krithi Archive
// (https://www.shivkumar.org/music/varnams/), transcribed cell-by-cell from
// the PDF renderings. **Bold** swaras in the source = tara stayi (octave +1);
// lowercase = mandara stayi (octave -1); plain capital = madhya stayi.
//
// ---------------------------------------------------------------------------
// Cell DSL (parsed by `c()` below)
// ---------------------------------------------------------------------------
//   "S", "R", "G", "M", "P", "D", "N"   — bare letter, madhya stayi.
//   "+S", "+R", ...                      — tara stayi (one octave up).
//   "-D", "-P", ...                      — mandara stayi (one octave down).
//   "."                                  — kaarvai (sustain previous note).
// Each raga's `scale` (below) maps the bare letters to the actual
// swarasthanas (R1/R2/R3, G1/G2/G3, etc.) used by THAT raga, so the same
// notation tokens render correctly across different ragas.
// ---------------------------------------------------------------------------

// Map bare letter → actual swara, given the raga's swarasthana set.
function resolveSwara(letter, scale) {
  return scale[letter] ?? letter
}

// Build a cell from compact tokens.
function c(tok, ly = '') {
  if (tok === '.' || tok === ',') return { kaarvai: true, ly }
  let oct = 0
  let letter = tok
  if (tok.startsWith('+')) { oct = 1; letter = tok.slice(1) }
  else if (tok.startsWith('-') && tok.length > 1) { oct = -1; letter = tok.slice(1) }
  return { letter, oct, ly }
}

// Pair two parallel arrays (and resolve letters via `scale`).
function line(swaras, lyrics, scale) {
  if (swaras.length !== lyrics.length) {
    throw new Error(`Geetham line mismatch: ${swaras.length} swaras vs ${lyrics.length} lyrics:\n${swaras.join(' ')}\n${lyrics.join(' ')}`)
  }
  return swaras.map((s, i) => {
    const cell = c(s, lyrics[i])
    if (!cell.kaarvai) cell.sw = resolveSwara(cell.letter, scale)
    return cell
  })
}

// ---------- Raga scale tables ---------------------------------------------
// Maps each bare letter (S, R, G, M, P, D, N) to the actual swarasthana
// (S, R1/R2/R3, G1/G2/G3, M1/M2, P, D1/D2/D3, N1/N2/N3) used in this raga.
// `aro` / `ava` are exposed to the view for the keyboard's in-raga shading
// and the Aro/Ava legend strip.
const SCALES = {
  // 15th mela Mayamalavagowla janya — pentatonic shaadava-shaadava.
  malahari: {
    name: 'Malahari', janyaOf: 'Mayamalavagowla (15)',
    map: { S:'S', R:'R1', G:'G3', M:'M1', P:'P', D:'D1', N:'N3' },
    aro: ['S','R1','M1','P','D1',"S'"],
    ava: ["S'",'D1','P','M1','G3','R1','S'],
  },
  // 28th mela Harikambhoji janya — pure pentatonic on white keys S R G P D.
  mohanam: {
    name: 'Mohanam', janyaOf: 'Harikambhoji (28)',
    map: { S:'S', R:'R2', G:'G3', P:'P', D:'D2' },
    aro: ['S','R2','G3','P','D2',"S'"],
    ava: ["S'",'D2','P','G3','R2','S'],
  },
  // 29th mela Dheerasankarabharanam janya — drops G and N.
  suddhaSaveri: {
    name: 'Suddha Saveri', janyaOf: 'Dheerasankarabharanam (29)',
    map: { S:'S', R:'R2', M:'M1', P:'P', D:'D2' },
    aro: ['S','R2','M1','P','D2',"S'"],
    ava: ["S'",'D2','P','M1','R2','S'],
  },
  // 65th mela — sampoorna, prati madhyama.
  kalyani: {
    name: 'Kalyani', janyaOf: 'Mechakalyani (65)',
    map: { S:'S', R:'R2', G:'G3', M:'M2', P:'P', D:'D2', N:'N3' },
    aro: ['S','R2','G3','M2','P','D2','N3',"S'"],
    ava: ["S'",'N3','D2','P','M2','G3','R2','S'],
  },
  // 29th mela janya. Vakra avarohanam — N is N2 (kaisiki) but transcribed
  // as plain N here since the geetham uses only one form.
  aarabhi: {
    name: 'Aarabhi', janyaOf: 'Dheerasankarabharanam (29)',
    map: { S:'S', R:'R2', G:'G2', M:'M1', P:'P', D:'D2', N:'N2' },
    aro: ['S','R2','M1','P','D2',"S'"],
    ava: ["S'",'N2','D2','P','M1','G2','R2','S'],
  },
  // 20th mela Natabhairavi janya. Bhairavi is famous for using BOTH D2
  // (chathushruthi, in arohanam) and D1 (shuddha, in avarohanam) — the
  // canonical "vakra" feature of the raga. The geetham notation makes
  // this explicit with "D1" and "D2" tokens (resolved directly, bypassing
  // this letter map).
  bhairavi: {
    name: 'Bhairavi', janyaOf: 'Natabhairavi (20)',
    map: { S:'S', R:'R2', G:'G2', M:'M1', P:'P', N:'N2' },
    aro: ['S','G2','R2','G2','M1','P','D2','N2',"S'"],
    ava: ["S'",'N2','D1','P','M1','G2','R2','S'],
  },
}

// Special token resolver: in Bhairavi, "D1" / "D2" / "M1" / "M2" appear
// directly in the swara stream. We extend `c()` for those.
function expand(tok, scale) {
  if (tok === '.' || tok === ',') return { kaarvai: true }
  let oct = 0
  if (tok.startsWith('+')) { oct = 1; tok = tok.slice(1) }
  else if (tok.startsWith('-') && tok.length > 1) { oct = -1; tok = tok.slice(1) }
  // Direct two-letter tokens (e.g. "D1", "M2") — use as-is.
  if (/^[SRGMPDN][123]$/.test(tok)) return { sw: tok, oct }
  // Otherwise resolve via the raga's letter map.
  return { sw: resolveSwara(tok, scale.map), oct }
}

// Build a line where swaras may include direct tokens like "D1" or "M2".
function L(swaras, lyrics, scale) {
  if (swaras.length !== lyrics.length) {
    throw new Error(`Line mismatch (${swaras.length} vs ${lyrics.length}):\n${swaras.join(' ')}\n${lyrics.join(' ')}`)
  }
  return swaras.map((s, i) => ({ ...expand(s, scale), ly: lyrics[i] }))
}

// =========================================================================
// 1. Sri Gananatha (Lambodara) — Malahari, Rupakam (Chathurasra Jathi)
// =========================================================================
// 6-akshara avarta. Two avartas per visible line → 12 cells.
// Bars at 2 (anga), 8 (anga); double-bars at 6 and 12 (avarta).
// Bold tara stayi noted explicitly via "+" prefix.
const _malahari = SCALES.malahari
const lambodara = {
  id: 'lambodara',
  title: 'Sri Gananatha',
  altTitle: 'Lambodara',
  composer: 'Purandara Daasa',
  language: 'Kannada',
  ragam: _malahari,
  talam: { name: 'Rupakam', jathi: 'Chathurasra', aksharas: 6 },
  cellsPerAvarta: 12,
  barsAt: [2, 8],
  bigBarsAt: [6, 12],
  source: 'shivkumar.org/music/varnams/lambodara-geetham.pdf',
  meaning:
    "Salutation to Sri Ganesha — leader of the ganas, vermillion-hued, ocean of compassion, " +
    "elephant-faced, with the prominent belly that gives him his name (Lambodara), holder of " +
    "Lakshmi, son of Parvati, worshipped by the gods.",
  sections: [
    { label: 'Pallavi', lines: [
      L(['M','P','D','+S','+S','+R',  '+R','+S','D','P','M','P'],
        ['Sree','-','Ga','na','na','tha', 'sin','dhu','-','ra','var','na'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Ka','ru','na','Sa','ga','ra', 'ka','ri','va','dha','-','na'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Am','-','ba','-','su','tha', 'a','ma','ra','vi','nu','tha'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
    ]},
    { label: 'Charanam 1', lines: [
      L(['M','P','D','+S','+S','+R',  '+R','+S','D','P','M','P'],
        ['Sid','dha','cha','-','ra','na', 'ga','na','se','-','vi','tha'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Sid','dhi','vi','na','ya','ka', 'the','-','na','mo','na','mo'], _malahari),
      // (Lam) — return to the Pallavi closing trio: "Lambodara… Ambasutha… Lambodara".
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Am','-','ba','-','su','tha', 'a','ma','ra','vi','nu','tha'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
    ]},
    { label: 'Charanam 2', lines: [
      L(['M','P','D','+S','+S','+R',  '+R','+S','D','P','M','P'],
        ['Sa','ka','la','vi','dya','-', '-','dhi','pu','-','ji','tha'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Sa','-','rvo','-','tha','ma', 'the','-','na','mo','na','mo'], _malahari),
      // (Lam) — same closing trio as Charanam 1.
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
      L(['R','M','P','D','M','P',  'D','P','M','G','R','S'],
        ['Am','-','ba','-','su','tha', 'a','ma','ra','vi','nu','tha'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Lam','bo','dha','-','-','ra', 'la','ku','mi','ka','ra','-'], _malahari),
    ]},
  ],
}

// =========================================================================
// 2. Kunda Gowra — Malahari, Rupakam
// =========================================================================
const kundaGowra = {
  id: 'kundagowra',
  title: 'Kunda Gowra',
  composer: 'Purandara Daasa',
  language: 'Kannada',
  ragam: _malahari,
  talam: { name: 'Rupakam', jathi: 'Chathurasra', aksharas: 6 },
  cellsPerAvarta: 12,
  barsAt: [2, 8],
  bigBarsAt: [6, 12],
  source: 'shivkumar.org/music/varnams/kundagoura-geetham.pdf',
  meaning:
    "An invocation to Goddess Parvati — the fair (gowra) one, like a kunda flower — and to " +
    "Lord Shiva (Hemakuta-simhasana, Virupaksha), seated atop the golden mountain.",
  sections: [
    { label: 'Pallavi', lines: [
      L(['D','P','M','G','R','S',  'R','M','P','D','M','P'],
        ['Kun','da','Gou','-','-','ra', 'Gou','-','Ri','-','va','ra'], _malahari),
      L(['D','+R','+R','+S','D','P',  'D','P','M','G','R','S'],
        ['Man','di','-','ra','-','ya', 'ma','-','na','ma','ku','ta'], _malahari),
    ]},
    { label: 'Anupallavi', lines: [
      L(['S','.','R','.','R','.',  'D','P','M','G','R','S'],
        ['Man','-','da','-','ra','-', 'ku','su','ma','-','ka','ra'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Ma','ka','ran','-','dam','-', 'va','-','si','thu','va','-'], _malahari),
    ]},
    { label: 'Charanam 1', lines: [
      L(['D','P','M','G','R','S',  'R','M','P','D','M','P'],
        ['He','ma','ku','-','-','ta', 'sim','-','ha','-','sa','na'], _malahari),
      L(['D','+R','+R','+S','D','P',  'D','P','M','G','R','S'],
        ['Vi','ru','pa','ra','-','ksha', 'ka','ru','na','-','ka','ra'], _malahari),
      // (Man) — return to the Anupallavi pair before continuing.
      L(['S','.','R','.','R','.',  'D','P','M','G','R','S'],
        ['Man','-','da','-','ra','-', 'ku','su','ma','-','ka','ra'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Ma','ka','ran','-','dam','-', 'va','-','si','thu','va','-'], _malahari),
    ]},
    { label: 'Charanam 2', lines: [
      L(['D','P','M','G','R','S',  'R','M','P','D','M','P'],
        ['Chan','da','ma','-','-','ma', 'man','-','da','-','gi','ni'], _malahari),
      L(['D','+R','+R','+S','D','P',  'D','P','M','G','R','S'],
        ['Man','-','di','ra','-','ya', 'ma','-','na','ma','ku','ta'], _malahari),
      // (Man) — same Anupallavi return as Charanam 1.
      L(['S','.','R','.','R','.',  'D','P','M','G','R','S'],
        ['Man','-','da','-','ra','-', 'ku','su','ma','-','ka','ra'], _malahari),
      L(['S','R','M','.','G','R',  'S','R','G','R','S','.'],
        ['Ma','ka','ran','-','dam','-', 'va','-','si','thu','va','-'], _malahari),
    ]},
  ],
}

// =========================================================================
// 3. Padumanaabha — Malahari, Triputa (Chathurasra Jathi)
// =========================================================================
// 8-akshara Triputa, but the geetham phrasing groups into 7 cells per
// avarta (3 + 2 + 2). 14 cells total per visible line.
const padumanaabha = {
  id: 'padumanaabha',
  title: 'Padumanaabha',
  composer: 'Purandara Daasa',
  language: 'Sanskrit',
  ragam: _malahari,
  talam: { name: 'Triputa', jathi: 'Chathurasra', aksharas: 8 },
  cellsPerAvarta: 14,
  barsAt: [3, 5, 10, 12],
  bigBarsAt: [7, 14],
  source: 'shivkumar.org/music/varnams/padumanabha-geetham.pdf',
  meaning:
    "Praise to Vishnu, the lotus-naveled one (Padumanaabha) — supreme being, embodiment of " +
    "eternal flame, dweller in the mighty ocean, reposing on Adisesha; and as Rama, " +
    "protector of yagnyas and savior of Vibhishana.",
  sections: [
    { label: 'Pallavi', lines: [
      L(['R','S','-D','S','.','S','.',  'M','G','R','M','M','P','.'],
        ['Pa','du','ma','na','-','bha','-', 'pa','ra','ma','pu','ru','sha','-'], _malahari),
      L(['S','D','D','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['Pa','ram','-','jo','-','-','thi', 'swa','ru','-','pa','-','-','-'], _malahari),
      L(['R','S','-D','S','.','S','.',  'M','G','R','M','M','P','.'],
        ['Vi','du','ra','van','-','dhia','-', 'vi','ma','la','cha','ri','tha','-'], _malahari),
      L(['S','D','D','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['Vi','hang','-','ga','-','-','di', 'ro','-','ha','na','-','-','-'], _malahari),
    ]},
    { label: 'Anupallavi', lines: [
      L(['P','M','P','D','+S','D','+S',  '+R','+S','D','D','+S','D','P'],
        ['U','dha','dhi','ni','va','-','sa', 'u','ra','ga','sa','ya','-','na'], _malahari),
      L(['D','D','P','P','.','P','M',  'R','M','M','P','.','P','.'],
        ['U','-','nna','tho','-','nna','tha', 'ma','hi','-','ma','-','-','-'], _malahari),
      L(['D','D','P','P','.','P','M',  'R','.','M','M','G','R','S'],
        ['Ya','du','ku','lo','-','ttha','ma', 'ye','-','gna','ra','-','ksha','ka'], _malahari),
      L(['S','.','S','D','D','D','P',  'P','.','P','M','G','R','S'],
        ['A','-','gna','si','-','ksha','ka', 'ra','-','ma','na','-','-','ma'], _malahari),
    ]},
    { label: 'Charanam', lines: [
      L(['D','+S','.','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['Vi','bhee','-','sha','na','pa','-', 'la','ka','-','na','mo','na','mo'], _malahari),
      L(['D','+S','.','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['I','bha','-','va','ra','da','-', 'ya','ka','-','na','mo','na','mo'], _malahari),
      L(['P','M','P','D','+S','D','+S',  '+R','+S','D','D','+S','D','P'],
        ['Su','bha','-','Pra','da','Su','ma', 'no','-','ra','da','-','-','Su'], _malahari),
      L(['D','D','P','P','.','P','M',  'R','.','M','P','.','.','.'],
        ['Re','-','ndra','Ma','-','no','-', 'ran','-','ja','na','-','-','-'], _malahari),
      L(['D','D','P','P','.','P','M',  'R','.','M','M','G','R','S'],
        ['A','bhi','-','na','-','va','pu', 'ran','-','da','ra','-','-','vi'], _malahari),
      L(['S','.','S','D','D','D','P',  'P','.','P','M','G','R','S'],
        ['tal','-','la','bhal','-','la','re', 'ra','-','ma','na','-','-','ma'], _malahari),
    ]},
  ],
}

// =========================================================================
// 4. Kereya Neeranu — Malahari, Triputa (Chathurasra Jathi)
// =========================================================================
const kereyaNeeranu = {
  id: 'kereyaneeranu',
  title: 'Kereya Neeranu',
  composer: 'Purandara Daasa',
  language: 'Kannada',
  ragam: _malahari,
  talam: { name: 'Triputa', jathi: 'Chathurasra', aksharas: 8 },
  cellsPerAvarta: 14,
  barsAt: [3, 5, 10, 12],
  bigBarsAt: [7, 14],
  source: 'shivkumar.org/music/varnams/kerayaneeranu-geetham.pdf',
  meaning:
    "Look at the devotees of Hari! They scoop water from a lake and pour it back as offering. " +
    "In just that way, the life Hari has lent to us is surrendered back to him in worship.",
  sections: [
    { label: 'Pallavi', lines: [
      L(['D','+S','+S','D','P','M','P',  'D','D','P','M','M','P','P'],
        ['Ke','re','ya','Nee','-','ra','nu', 'Ke','re','ge','chal','-','li','-'], _malahari),
      L(['D','D','+S','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['Va','ra','va','pa','de','da','va', 'ran','-','te','Kaa','-','ni','ro'], _malahari),
      L(['S','R','R','S','R','S','R',  'D','D','P','M','G','R','S'],
        ['Ha','ri','ya','ka','ru','na','do', 'laa','-','da','bha','-','gya','va'], _malahari),
      L(['D','P','D','+S','.','D','P',  'D','D','P','M','G','R','S'],
        ['Ha','ri','sa','ma','-','rpa','ne', 'ma','-','di','ba','du','ki','ro'], _malahari),
      L(['S','R','R','S','R','S','R',  'D','D','P','M','G','R','S'],
        ['Ha','ri','ya','ka','ru','na','da', 'la','-','ya','bha','-','gya','va'], _malahari),
    ]},
    { label: 'Charanam 1', lines: [
      L(['D','+S','+S','D','P','M','P',  'D','D','P','M','M','P','P'],
        ['Sree','-','pu','ran','-','da','ra', 'vi','ta','la','ra','-','ya','-'], _malahari),
      L(['D','D','+S','D','P','M','P',  'D','D','P','M','G','R','S'],
        ['Cha','ra','na','ka','ma','la','va', 'no','-','di','ba','du','ki','ro'], _malahari),
      L(['S','R','R','S','R','S','R',  'D','D','P','M','G','R','S'],
        ['Ha','ri','ya','ka','ru','na','do', 'la','-','da','bha','-','gya','va'], _malahari),
      L(['D','P','D','+S','.','D','P',  'D','D','P','M','G','R','S'],
        ['Ha','ri','sa','ma','-','rpa','ne', 'ma','-','di','ba','du','ki','ro'], _malahari),
      L(['S','R','R','S','R','S','R',  'D','D','P','M','G','R','S'],
        ['Ha','ri','ya','ka','ru','na','da', 'la','-','da','bha','-','gya','va'], _malahari),
    ]},
  ],
}

// =========================================================================
// 5. Vara Veena — Mohanam, Rupakam
// =========================================================================
// Mohanam has no madhyama (M) and no nishada (N) — clean pentatonic on the
// notes S R G P D. Probably the most-loved beginner piece, on Lakshmi.
const _mohanam = SCALES.mohanam
const varaVeena = {
  id: 'varaveena',
  title: 'Vara Veena',
  composer: 'Traditional',
  language: 'Sanskrit',
  ragam: _mohanam,
  talam: { name: 'Rupakam', jathi: 'Chathurasra', aksharas: 6 },
  cellsPerAvarta: 12,
  barsAt: [2, 6, 8],
  bigBarsAt: [12],
  source: 'shivkumar.org/music/varnams/varaveena-geetham.pdf',
  meaning:
    "Goddess of the divine veena, with soft hands, lotus-petal eyes, dark curly tresses like " +
    "swarms of bees, worshipped by the devas. Holder of unequalled virtuous qualities — " +
    "Ranganaayaki, granter of all desires, mother of Brahma the lotus-seated. Victory!",
  sections: [
    { label: 'Geetham', lines: [
      L(['G','G','P','.','P','.',  'P','D','+S','.','+S','.'],
        ['Va','ra','vee','-','na','-', 'Mru','du','Pa','-','ni','-'], _mohanam),
      L(['+R','+S','D','D','P','.',  'D','P','G','G','R','.'],
        ['Va','na','ru','ha','Lo','-', 'cha','na','Raa','-','ni','-'], _mohanam),
      L(['G','P','D','+S','D','.',  'D','P','G','G','R','.'],
        ['Su','ru','chi','ra','Bam','-', 'bha','ra','Ve','-','ni','-'], _mohanam),
      L(['G','G','D','P','G','.',  'P','G','G','R','S','.'],
        ['Su','ra','nu','tha','Kal','-', 'ya','-','-','-','ni','-'], _mohanam),
      L(['G','G','G','G','R','G',  'P','G','P','.','P','.'],
        ['Ni','ru','pa','ma','Shu','bha', 'Gu','na','Lo','-','la','-'], _mohanam),
      L(['G','G','D','P','D','.',  'P','D','+S','.','+S','.'],
        ['Ni','ra','thi','Ja','ya','-', 'Pra','da','See','-','la','-'], _mohanam),
      L(['D','G','R','R','S','S',  'D','+S','D','D','D','P'],
        ['Va','ra','da','-','Pri','ya', 'Ran','ga','naa','-','ya','ki'], _mohanam),
      L(['G','P','D','+S','D','P',  'D','P','G','G','R','S'],
        ['Vaa','-','nchi','tha','Pha','la', 'Daa','-','-','-','ya','ki'], _mohanam),
      L(['S','R','G','.','G','.',  'G','R','P','G','R','.'],
        ['Sa','ra','si','-','ja','-', 'sa','na','Ja','na','ni','-'], _mohanam),
      L(['S','R','S','G','R','S',  'R','D','+S','.','+S','.'],
        ['Ja','ya','ja','ya','ja','ya', 'Ja','Ya','Va','-','Ni','-'], _mohanam),
    ]},
  ],
}

// =========================================================================
// 6. Aanalekara — Suddha Saveri, Triputa (Tisra Jathi)
// =========================================================================
// Tisra-jathi Triputa: 3 + 2 + 2 = 7 aksharas. Two avartas per line → 14 cells.
// Bars at 3, 5, 10, 12 (anga); double-bars at 7 and 14 (avarta).
// Note: this geetham frequently dwells on long kaarvai phrases ("a -")
// representing the "Aiyaa" call-out — those map to "." in our DSL.
const _suddhaSaveri = SCALES.suddhaSaveri
const analekara = {
  id: 'analekara',
  title: 'Aanalekara',
  composer: 'Traditional',
  language: 'Sanskrit',
  ragam: _suddhaSaveri,
  talam: { name: 'Triputa', jathi: 'Tisra', aksharas: 7 },
  cellsPerAvarta: 14,
  barsAt: [3, 5, 10, 12],
  bigBarsAt: [7, 14],
  source: 'shivkumar.org/music/varnams/analekara-geetham.pdf',
  meaning:
    "Even as we watch, the water stored in a tank leaks out through another outlet. In the " +
    "same way, a life lived without the awareness of the ancient scriptures is wasted.",
  sections: [
    { label: 'Pallavi', lines: [
      L(['R','M','R','R','S','D','S',  'S','.','S','D','P','M','P'],
        ['A','-','na','le','-','ka','ra', 'un','-','ni','po','-','la','di'], _suddhaSaveri),
      L(['D','D','S','D','.','D','P',  'P','M','R','D','D','D','P'],
        ['sa','ka','la','sha','-','sthrapu','-', 'ra','-','na','di','-','nam','-'], _suddhaSaveri),
      L(['P','.','P','D','D','D','P',  'P','.','P','M','P','D','P'],
        ['tha','-','la','di','-','nam','-', 'tha','-','la','pa','ri','ga','thu'], _suddhaSaveri),
      L(['P','M','R','S','R','S','R',  'P','M','P','S','R','S','R'],
        ['re','-','re','a','-','-','-', 'a','-','-','a','-','-','-'], _suddhaSaveri),
      L(['P','P','D','P','P','M','R',  'R','S','R','M','.','M','.'],
        ['a','-','-','a','-','-','-', 'se','-','thu','va','-','ha','-'], _suddhaSaveri),
      L(['D','P','D','S','.','S','.',  'R','R','S','D','P','M','P'],
        ['pa','ri','ga','tham','-','nam','-', 'ja','ta','-','ju','-','-','ta'], _suddhaSaveri),
      L(['D','D','S','D','.','D','P',  'P','M','R','D','D','D','P'],
        ['sa','ka','la','sha','-','sthrapu','-', 'ra','-','na','di','-','nam','-'], _suddhaSaveri),
      L(['P','.','P','D','D','D','P',  'P','.','P','M','P','D','P'],
        ['Tha','-','la','di','-','nam','-', 'tha','-','la','pa','ri','ga','thu'], _suddhaSaveri),
    ]},
    { label: 'Charanam', lines: [
      L(['P','M','R','S','R','S','R',  'P','M','P','S','R','S','R'],
        ['re','-','re','a','-','-','-', 'a','-','-','a','-','a','-'], _suddhaSaveri),
      L(['P','P','D','P','P','M','R',  'R','S','R','M','.','M','.'],
        ['a','-','-','a','-','-','-', 'se','-','thu','va','-','ha','-'], _suddhaSaveri),
      L(['D','P','D','S','.','S','.'],
        ['pa','ri','ga','tham','-','nam','-'], _suddhaSaveri),
    ]},
  ],
}

// =========================================================================
// 7. Kamalajadala — Kalyani, Misra Chapu
// =========================================================================
// Misra Chapu = 7 beats counted 3 + 2 + 2 (or 1+2 + 2+2). Two avartas per
// visible line → 14 cells. Bars at 3, 7 (avarta), 10, 14 (avarta end).
const _kalyani = SCALES.kalyani
const kamalajadala = {
  id: 'kamalajadala',
  title: 'Kamalajadala',
  composer: 'Traditional',
  language: 'Sanskrit',
  ragam: _kalyani,
  talam: { name: 'Misra Chapu', jathi: '—', aksharas: 7 },
  cellsPerAvarta: 14,
  barsAt: [3, 10],
  bigBarsAt: [7, 14],
  source: 'shivkumar.org/music/varnams/kamalajathala-kalyani-geetham.pdf',
  meaning:
    "O Merciful one, lotus-eyed Vishnu, ocean of compassion who showed grace to Gajendra, " +
    "lord of Lakshmi, slayer of Keshi and Narakaasura. Your exalted presence dwells in " +
    "Velapura — you are the greatest among the gods.",
  sections: [
    { label: 'Geetham', lines: [
      L(['S','S','S','N','D','N','S',  'N','D','P','D','P','M','P'],
        ['Ka','ma','la','jaa','-','da','la', 'Vi','ma','la','Su','na','ya','na'], _kalyani),
      L(['G','M','P','P','D','D','N',  'D','P','M','P','G','R','S'],
        ['Ka','ri','Va','ra','da','-','-', 'Ka','ru','naa','mbu','dhe','-','-'], _kalyani),
      L(['D','D','D','G','G','G','.',  'M','P','.','M','G','R','S'],
        ['Ka','ru','na','Sha','ra','dhe','-', 'Ka','ma','-','laa','-','-','-'], _kalyani),
      L(['R','.','.','S','.','.','.',  '.','.','.','.','.','.','.'],
        ['Kaan','-','-','thaa','-','-','-', '-','-','-','-','-','-','-'], _kalyani),
      L(['G','M','P','M','P','D','P',  'N','D','P','D','P','M','P'],
        ['Ke','-','shi','Na','ra','kaa','-', 'su','ra','Vi','bhe','-','da','na'], _kalyani),
      L(['G','M','P','P','D','D','N',  'D','P','M','P','G','R','S'],
        ['Va','ra','dha','Ve','-','la','a', 'pu','ra','Su','ro','-','tta','ma'], _kalyani),
    ]},
  ],
}

// =========================================================================
// 8. Re Re Sri Ramachandra — Aarabhi, Triputa (Tisra Jathi)
// =========================================================================
// Lots of mandara stayi here — descents below madhya Sa for "Sritajana"
// and the "aiyaa-aiyaa" call-out. Mandara cells use "-X" prefix.
const _aarabhi = SCALES.aarabhi
const reReSriRama = {
  id: 'reresrirama',
  title: 'Re Re Sri Ramachandra',
  composer: 'Traditional',
  language: 'Sanskrit',
  ragam: _aarabhi,
  talam: { name: 'Triputa', jathi: 'Tisra', aksharas: 7 },
  cellsPerAvarta: 14,
  barsAt: [3, 5, 10, 12],
  bigBarsAt: [7, 14],
  source: 'shivkumar.org/music/varnams/reresrirama-arabhi-geetham.pdf',
  meaning:
    "O Sri Ramachandra! Beacon of the Raghu dynasty, lord of devas and ordinary mortals, " +
    "joy of Sita, brave one who vanquished Ravana, wish-fulfilling tree to your devotees — " +
    "protect me!",
  sections: [
    { label: 'Pallavi', lines: [
      L(['P','.','P','M','M','P','.',  'M','G','R','S','R','M','G'],
        ['Re','-','re','Shree','-','ra','-', '-','-','ma','chan','-','-','-'], _aarabhi),
      L(['R','R','S','S','D','R','S',  'R','.','.','R','.','S','R'],
        ['-','-','-','-','-','-','-', 'ndra','-','-','-','-','Ra','ghu'], _aarabhi),
      L(['M','G','R','R','S','S','.',  'P','M','M','P','.','P','.'],
        ['Vam','-','sha','Ti','la','ka','-', 'Ra','-','gha','ven','-','dra','-'], _aarabhi),
      L(['P','M','P','M','G','R','R',  'M','G','R','S','R','S','S'],
        ['A','-','-','-','-','-','-', 'a','-','-','-','-','-','-'], _aarabhi),
      L(['S','-D','R','S','R','S','S',  '-D','S','.','-D','-D','-D','-P'],
        ['A','-','-','-','-','-','-', 'a','-','-','Sri','tha','ja','na'], _aarabhi),
      L(['-P','-M','-P','-D','S','S','.',  'R','S','R','M','G','R','R'],
        ['Po','-','sha','ku','-','re','-', 'See','-','-','tha','-','-','Ma'], _aarabhi),
      L(['M','G','R','M','M','P','M',  'P','.','P','P','.','P','.'],
        ['no','-','-','ran','-','ja','nu', 'Re','-','re','Dhee','-','ra','-'], _aarabhi),
      L(['P','M','P','D','S','S','R',  'M','G','R','S','R','S','S'],
        ['Ra','-','va','na','-','su','ra', 'An','-','tha','ku','-','re','-'], _aarabhi),
      L(['+S','+D','+R','+S','+R','+S','+S',  'D','+S','.','D','D','D','P'],
        ['A','-','-','yi','ya','yi','ya', 'a','-','-','yi','ya','yi','ya'], _aarabhi),
      L(['P','M','P','+D','+S','+S','.',  '+S','.','+S','D','D','D','P'],
        ['A','-','-','yi','ya','re','-', 'Dhee','-','na','Ja','na','Man','-'], _aarabhi),
      L(['P','M','P','M','G','R','R'],
        ['daa','-','ru','Maa','-','ma','va'], _aarabhi),
    ]},
  ],
}

// =========================================================================
// 9. Sri Ramachandra (Bhairavi) — Bhairavi, Dhruva Talam (Chathurasra Jathi)
// =========================================================================
// Dhruva Talam I4 O I4 I4 = Laghu(4) + Drutham(2) + Laghu(4) + Laghu(4) =
// 14 aksharas in one avarta. We render at 1 cell per akshara → 14 cells per
// line. Bars at the anga boundaries: 4, 6, 10; double-bar at 14.
//
// Bhairavi uses BOTH dhaivatas — D2 in arohanam phrases, D1 in avarohanam
// phrases — so the line tokens emit "D1" / "D2" / "M1" / "M2" directly.
const _bhairavi = SCALES.bhairavi
const sriRamaBhairavi = {
  id: 'srirama-bhairavi',
  title: 'Sri Ramachandra',
  altTitle: 'Asrita Paarijaata',
  composer: 'Traditional',
  language: 'Sanskrit',
  ragam: _bhairavi,
  talam: { name: 'Dhruva', jathi: 'Chathurasra', aksharas: 14 },
  cellsPerAvarta: 14,
  barsAt: [4, 6, 10],
  bigBarsAt: [14],
  source: 'shivkumar.org/music/varnams/srirama-bhairavi-geetham.pdf',
  meaning:
    "Sri Ramachandra is like the wish-granting Paarijaata tree to all his devotees. He " +
    "delights everyone with his divine qualities, like a bee hovering over Sita's lotus-face. " +
    "May He grant his blessings forever.",
  sections: [
    { label: 'Geetham', lines: [
      L(['G','R','G','M','P','.','M','G','R','G','M','P','M','.'],
        ['Shree','-','Raa','-','ma','-','chan','-','draa','-','Sri','tha','Paa','-'], _bhairavi),
      L(['P','D2','N','N','D1','P','M','N','D1','P','M','G','R','S'],
        ['-','ri','jaa','-','-','tha','Sa','ma','-','-','-','-','-','stha'], _bhairavi),
      L(['S','R','S','P','M','P','G','R','G','M','G','G','R','S'],
        ['Kal','-','-','ya','-','na','Gu','na','-','bhi','raa','-','-','ma'], _bhairavi),
      L(['R','R','G','G','M','M','G','G','R','G','M','P','M','M'],
        ['See','-','tha','-','Mu','kha','Am','-','-','-','bo','-','ru','ha'], _bhairavi),
      L(['P','D2','D2','N','N','+S','P','D2','N','+S','+R','+G','+R','S'],
        ['San','-','-','-','-','cha','ree','-','-','-','-','-','-','ka'], _bhairavi),
      L(['N','+R','+S','+G','+R','+S','N','N','D1','M','P','D2','N','+S'],
        ['Ni','ran','-','tha','ram','-','Man','-','ga','la','Ma','-','-','ta'], _bhairavi),
      L(['P','D1','P','+S','N','+S','P','D1','M','P','G','.','R','S'],
        ['No','-','-','tu','-','-','-','-','-','-','-','-','-','-'], _bhairavi),
    ]},
  ],
}

// ---------------------------------------------------------------------------

export const GEETHAMS = [
  lambodara,
  kundaGowra,
  padumanaabha,
  kereyaNeeranu,
  varaVeena,
  analekara,
  kamalajadala,
  reReSriRama,
  sriRamaBhairavi,
]

export function getGeethamById(id) {
  return GEETHAMS.find((g) => g.id === id) ?? GEETHAMS[0]
}
