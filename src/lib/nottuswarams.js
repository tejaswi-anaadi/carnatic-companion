// Nottuswarams — a set of 33 (extant) compositions by Muthuswami Dikshitar,
// all set in the ragam Sankarabharanam (29th mela). They are unique in the
// Carnatic repertoire: Dikshitar fused old Western classical / military-band
// tunes (heard in Madras during the British era) with Sanskrit devotional
// lyrics, while stripping away the traditional gamakams. The result sounds
// closer to the Western major scale than to standard Carnatic — a perfect
// stepping stone for beginners and children to sing actual Dikshitar lyrics
// before tackling fully-gamaka-laden krithis.
//
// Notation source: PDF reference shared by the user (Breathe Music Academy);
// transcribed cell-by-cell. Marked corrections from the PDF have been
// applied — see inline notes on row 4 of "Sakthi Sahitha Ganapathim" and
// row 5 of "Vande Meenakshi".
//
// ---------------------------------------------------------------------------
// Cell DSL
// ---------------------------------------------------------------------------
//   "S", "R", "G", "M", "P", "D", "N"   — bare letter, madhya stayi.
//   "+S", "+R", ...                      — tara stayi (one octave up).
//   "-D", "-P", ...                      — mandara stayi (one octave down).
//   "."                                  — kaarvai (sustain previous note).
// ---------------------------------------------------------------------------

// All nottuswarams use Sankarabharanam (29th mela). Although the source PDF
// marks N as "N*" (a flute half-note convention), the actual pitch is N3
// (kakali nishadam), the standard Sankarabharanam nishadam.
const SANKARABHARANAM = {
  name: 'Sankarabharanam',
  janyaOf: 'Dheerasankarabharanam (29) — itself the 29th mela',
  map: { S: 'S', R: 'R2', G: 'G3', M: 'M1', P: 'P', D: 'D2', N: 'N3' },
  aro: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3', "S'"],
  ava: ["S'", 'N3', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
}

function resolveSwara(letter, scale) {
  return scale[letter] ?? letter
}

function expand(tok, scale) {
  if (tok === '.' || tok === ',') return { kaarvai: true }
  let oct = 0
  if (tok.startsWith('+')) { oct = 1; tok = tok.slice(1) }
  else if (tok.startsWith('-') && tok.length > 1) { oct = -1; tok = tok.slice(1) }
  // Direct two-letter tokens (e.g. "R1", "D1") — used for anya-swaras like
  // shuddha rishabham in mucukundavarada. Bypass the raga's letter map.
  if (/^[SRGMPDN][123]$/.test(tok)) return { sw: tok, oct }
  return { sw: resolveSwara(tok, scale.map), oct }
}

function L(swaras, lyrics, scale = SANKARABHARANAM) {
  if (swaras.length !== lyrics.length) {
    throw new Error(
      `Nottuswaram line mismatch (${swaras.length} swaras vs ${lyrics.length} lyrics):\n` +
        swaras.join(' ') + '\n' + lyrics.join(' '),
    )
  }
  return swaras.map((s, i) => ({ ...expand(s, scale), ly: lyrics[i] }))
}

// =========================================================================
// 1. Syamale Meenakshi  (Adi)
// =========================================================================
// Adi tala — 8 aksh × 2 sub-cells = 16 cells per avarta.
// PDF column layout: Laghu (8 cells) | Drutham (4) | Drutham (4).
const syamale = {
  id: 'syamale',
  title: 'Syamale Meenakshi',
  number: 1,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Adi', jathi: 'Chathurasra', aksharas: 8 },
  cellsPerAvarta: 16,
  barsAt: [8, 12],
  bigBarsAt: [16],
  meaning:
    'Salutation to Syamala Meenakshi (the dark-hued, fish-eyed mother), consort of ' +
    'Sundareswara, sister of Guruguha, born of the ocean of milk — pacifier of the lowly, ' +
    'lotus-eyed, lotus-seated, beloved of Hari and Lakshmi.',
  sections: [
    { label: 'Geetham', lines: [
      L(['S','.','.','R',  'G','.','M','.',  'P','.','.','.',  'P','.','.','.'],
        ['SyA','-','-','ma',  'lE','-','Mee','-',  'na','-','-','-',  'kshi','-','-','-']),
      L(['D','.','.','N',  '+S','.','+S','N',  'D','.','P','.',  'M','.','G','.'],
        ['Sun','-','-','da',  'rE','-','swa','ra',  'sA','-','-','-',  'Kshi','-','-','-']),
      // Lines 3 & 4: "Guruguha" starts on R₂ (cell 6), continues through S
      // at cell 14 ("Sa-"), then row 4 carries "(Sa-)mudh-bha-ve Si-ve-va".
      // Cells 6, 8, 12 of row 4 (-N, S, S) carry "Si ve va".
      L(['M','.','D','.',  'M','.','R','.',  'G','.','P','.',  'G','.','S','.'],
        ['San','-','ka','-',  'ri','-','Gu','-',  'Ru','-','Gu','-',  'ha','-','Sa-','-']),
      L(['R','.','M','.',  'R','.','-N','.',  'S','.','.','.',  'S','.','.','.'],
        ['mudh','-','bha','-',  've','-','Si','-',  've','-','-','-',  'va','-','-','-']),
      L(['P','.','.','.',  'P','.','P','.',  'M','.','.','.',  'M','.','M','.'],
        ['pA','-','-','-',  'ma','-','ra','-',  'mO','-','-','-',  'cha','-','ni','-']),
      L(['G','.','.','.',  'G','.','G','.',  'R','.','.','.',  'R','.','R','.'],
        ['pan','-','-','-',  'ka','-','ja','-',  'lO','-','-','-',  'cha','-','ni','-']),
      L(['P','.','.','.',  'P','.','D','P',  'M','.','.','.',  'M','.','P','M'],
        ['pad','-','-','-',  'mA','-','sa','na',  'vA','-','-','-',  'ni','-','ha','ri']),
      L(['G','.','.','.',  'G','.','M','G',  'R','.','.','.',  'R','.','G','R'],
        ['lak','-','-','-',  'shmi','-','vi','nu',  'te','-','-','-',  'sAm','-','bha','vi']),
    ]},
  ],
  repeatFirstLines: 4,
}

// =========================================================================
// 2. Santhatham Pahimam  (Rupakam)
// =========================================================================
// Rupakam — 6 aksh × 2 sub-cells = 12 cells per avarta.
// PDF column layout: 2 cols of 6 cells each.
const santhatham = {
  id: 'santhatham',
  title: 'Santhatham Pahimam',
  number: 2,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Rupakam', jathi: 'Chathurasra', aksharas: 6 },
  cellsPerAvarta: 12,
  barsAt: [6],
  bigBarsAt: [12],
  meaning:
    'Always protect me, O Goddess of music, dark-hued one, supporter of all, Janani — ' +
    'object of meditation, pure-formed, attended by Sri Guruguha, ocean of compassion ' +
    'to those devoted to Shiva.',
  sections: [
    { label: 'Geetham', lines: [
      L(['S','.','S','.','R','.',  '-N','.','.','S','R','.'],
        ['san','-','tha','-','tham','-',  'pA','-','-','hi','mAm','-']),
      L(['G','.','G','.','M','.',  'G','.','.','R','S','.'],
        ['san','-','gee','-','tha','-',  'syA','-','-','ma','lE','-']),
      // Line 3: 1 kaarvai after S (not 2), so "Janani" lands one slot earlier.
      L(['R','.','S','.','-N','.',  'S','.','-P','-D','-N','.'],
        ['sar','-','vA','-','dhA','-',  'rE','-','Ja','na','ni','-']),
      L(['R','.','S','.','-N','.',  'S','.','.','.','.','.'],
        ['sar','-','vA','-','dhA','-',  'rE','-','-','-','-','-']),
      // Line 5: lyric correction — "thA" (intent/purpose) not "dha" — yields
      // "chinthithArtha-pradE" = grants the contemplated wish.
      L(['P','.','P','.','P','.',  'P','.','.','M','G','.'],
        ['chin','-','thin','-','thAr','-',  'thA','-','-','pra','dE','-']),
      L(['M','.','M','.','M','.',  'M','.','.','G','R','.'],
        ['Chi','-','th','-','rU','-',  'pi','-','-','nee','si','vE']),
      L(['G','.','M','G','R','S',  'G','.','.','M','P','.'],
        ['Sree','-','Gu','ru','gu','ha',  'sE','-','-','vi','thE','-']),
      L(['D','P','M','.','G','.',  'R','.','S','.','.','.'],
        ['Si','va','mO','-','ha','-',  'kA','-','rE','-','-','-']),
    ]},
  ],
}

// =========================================================================
// 3. Sakthi Sahitha Ganapathim  (Tisra Adi)
// =========================================================================
// Tisra-jathi Adi-style triputa — 4 cols of 3 cells each = 12 cells per row.
// (Row 4 has an extra cell in col 2 from the user's correction — see note.)
//
// **Corrections applied (per PDF markup):**
//   Row 4 col 2: original "R G S" → "R G S R" (extra R appended).
//   Row 4 col 3: original "P. S Ṇ" → "P. N R" (S Ṇ struck, N R added).
const sakthi = {
  id: 'sakthi',
  title: 'Sakthi Sahitha Ganapathim',
  number: 3,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Tisra Adi', jathi: 'Tisra', aksharas: 7 },
  cellsPerAvarta: 12,
  barsAt: [3, 6, 9],
  bigBarsAt: [12],
  meaning:
    'I meditate on Ganapathi — accompanied by Shakti, worshipped by Shankara and the ' +
    "great sages, nourisher of devotees, Vinayaka the loved son of Shiva, the great elephant-faced one " +
    'who grants both worldly enjoyment and liberation, whose lotus feet I worship.',
  sections: [
    { label: 'Geetham', lines: [
      L(['G','.','G',  'G','M','G',  'R','S','R',  'S','.','.'],
        ['sak','-','thi',  'sa','hi','tha',  'Ga','na','pa',  'thim','-','-']),
      L(['-N','.','S',  'R','.','-N',  'S','.','R',  'G','.','S'],
        ['san','-','ka',  'rA','-','di',  'sE','-','vi',  'tham','-','vi']),
      L(['G','.','G',  'G','M','G',  'R','S','R',  'S','R','G'],
        ['rak','-','tha',  'sa','ka','la',  'mu','ni','va',  'ra','su','ra']),
      // Row 4 (per user correction): M , G R G R | -P -N R | S , ,
      // Both -P and -N are mandara stayi — the N must descend with the P,
      // not jump up to madhya, otherwise the phrase contour breaks.
      // Lyric: Ra (kaarvai) ja vi nu tha gu ru gu ham (kaarvai kaarvai)
      L(['M','.','G','R','G','R',  '-P','-N','R',  'S','.','.'],
        ['Ra','-','ja','vi','nu','tha',  'gu','ru','gu',  'ham','-','-']),
      L(['R','.','.',  '-N','.','-P',  'S','.','G',  'R','.','.'],
        ['bhak','-','-',  'thA','-','ni',  'pO','-','sha',  'kam','-','-']),
      L(['R','G','R',  '-N','.','-P',  'S','.','G',  'R','.','.'],
        ['bha','va','su',  'tham','-','vi',  'nA','-','ya',  'kam','-','-']),
      L(['P','D','P',  'M','P','M',  'G','M','G',  'R','.','.'],
        ['bhak','thi','muk',  'thi','pra','dam',  'bhoo','shi','than',  'gam','-','-']),
      L(['S','R','S',  '-N','S','-N',  '-P','-D','-N',  'S','.','.'],
        ['rak','tha','pa',  'dAm','bu','jam',  'bhA','va','yA',  'Mi','-','-']),
    ]},
  ],
  repeatFirstLines: 4,
}

// =========================================================================
// 4. Vara Siva Balam  (Chaturashra Eka)
// =========================================================================
// Chaturashra Eka — laghu of 4 aksh. Two avartas per visible row at 2 sub-cells
// per akshara → 16 cells per row (8 + 8).
const varaSivaBalam = {
  id: 'varasivabalam',
  title: 'Vara Siva Balam',
  number: 4,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Chaturashra Eka', jathi: 'Chathurasra', aksharas: 4 },
  cellsPerAvarta: 16,
  barsAt: [8],
  bigBarsAt: [16],
  meaning:
    'Salutations to Subrahmanya — the noble son of Shiva, beloved of Valli, joyful in the ' +
    'play of Hari-Hara, swan-faced one of bliss, whose form is Sri Guruguha, hidden in mystery, ' +
    'protector of cows, leader of the celestial army, praised by all the gods.',
  sections: [
    { label: 'Geetham', lines: [
      L(['G','M','G','M',  'D','.','P','.',  'G','.','P','.',  'M','.','R','.'],
        ['Va','ra','Si','va',  'BA','-','-','lam',  'Val','-','lee','-',  'LO','-','lam','-']),
      L(['M','.','G','.',  'S','.','S','.',  'G','M','G','M',  'D','.','P','.'],
        ['Van','-','de','-',  'Nan','-','dam','-',  'Ha','ri','ha','ra',  'MO','-','dam','-']),
      L(['G','.','P','.',  'M','.','R','.',  'S','G','S','G',  'S','.','.','.'],
        ['Ham','-','sA','-',  'nan','-','dam','-',  'Ha','sa','sa','-',  'Mu','-','kam','-']),
      L(['N','+S','N','+S',  '+G','.','+R','.',  'N','.','+R','.',  '+S','.','D','.'],
        ['Gu','ru','Gu','ha',  'Roo','-','pam','-',  'Gup','-','thA','-',  'kA','-','ram','-']),
      L(['+S','.','N','.',  'P','.','P','.',  'N','+S','N','+S',  '+G','.','+R','.'],
        ['gO','-','rak','-',  'sham','-','tham','-',  'Su','ra','pa','thi',  'sE','-','nam','-']),
      L(['N','.','+R','.',  '+S','.','D','.',  'P','D','P','D',  '+S','.','.','.'],
        ['Sub','-','rah','-',  'man','-','yam','-',  'Su','ra','vi','nu',  'tham','-','-','-']),
    ]},
  ],
  repeatFirstLines: 3,
}

// =========================================================================
// 5. Rama Janardhana  (Tisra Adi)
// =========================================================================
// Same tala framing as Sakthi: 4 cols × 3 cells = 12 cells per row.
const ramaJanardhana = {
  id: 'ramajanardhana',
  title: 'Rama Janardhana',
  number: 5,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Tisra Adi', jathi: 'Tisra', aksharas: 7 },
  cellsPerAvarta: 12,
  barsAt: [3, 6, 9],
  bigBarsAt: [12],
  meaning:
    'Sri Rama Janardhana — slayer of Ravana, eldest of Lakshmana and the Raghu princes, ' +
    'remover of sins, lotus-eyed beloved of devotees; protector of the earth-born Sita, giver of ' +
    'enjoyment, lord of the earth, dark-skinned one, calm-hearted, brother to Guruguha, praised — ' +
    'O great Rama Chandra Prabhu!',
  sections: [
    { label: 'Geetham', lines: [
      L(['P','P','G',  'P','M','R',  'M','G','M',  'P','D','N'],
        ['Ra','ma','Ja',  'nAr','dha','na',  'rA','va','na',  'mar','dha','na']),
      L(['+S','P','D',  'P','M','G',  'R','G','R',  'R','.','.'],
        ['rA','mA','nu',  'jA','gra','ja',  'rA','ja','vi',  'bhO','-','-']),
      L(['P','P','G',  'P','M','R',  'M','G','M',  'P','D','N'],
        ['pA','ma','ra',  'mO','cha','na',  'pan','ka','ja',  'lO','cha','na']),
      L(['+S','P','D',  'P','M','G',  'R','G','S',  'S','.','.'],
        ['bhak','tha','ja',  'na','pri','ya',  'pA','la','ya',  'mAm','-','-']),
      L(['G','G','S',  'G','G','S',  'M','M','R',  'M','M','R'],
        ['bhoo','mi','ja',  'nA','ya','ka',  'bhuk','thi','pra',  'dA','ya','ka']),
      L(['M','P','D',  'P','M','G',  'R','G','R',  'R','.','.'],
        ['bhoo','su','ra',  'pA','la','na',  'bhoo','mi','pa',  'thE','-','-']),
      L(['G','G','S',  'G','G','S',  'M','M','R',  'M','M','R'],
        ['syA','ma','la',  'vi','gra','ha',  'sAn','tha','gu',  'ru','gu','ha']),
      L(['M','P','D',  'P','M','G',  'R','G','S',  'S','.','.'],
        ['san','nu','tha',  'sree','rA','ma',  'chan','dra','pra',  'bhO','-','-']),
    ]},
  ],
  repeatFirstLines: 4,
}

// =========================================================================
// 6. Vande Meenakshi  (Adi)
// =========================================================================
// Adi tala layout, 16 cells per avarta.
//
// **Correction applied (per PDF markup):**
//   Row 5 col 3: original "P . D ." → "P . D N" (kaarvai cell 16 → N).
const vandeMeenakshi = {
  id: 'vandemeenakshi',
  title: 'Vande Meenakshi',
  number: 6,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Adi', jathi: 'Chathurasra', aksharas: 8 },
  cellsPerAvarta: 16,
  barsAt: [8, 12],
  bigBarsAt: [16],
  meaning:
    'Salutations to Meenakshi — lotus-faced, dwelling in the Pandya land, mother goddess Durga, ' +
    'worshipped by gods, sister of Sundara Raja (Vishnu of Madurai), Gauri the auspicious one — ' +
    'I always salute her.',
  sections: [
    { label: 'Geetham', lines: [
      L(['S','.','G','.',  'S','.','G','.',  'S','.','G','.',  'M','G','R','S'],
        ['van','-','dE','-',  'mee','-','nA','-',  'kshi','-','tvAm','-',  'sa','ra','si','ja']),
      L(['-N','.','R','.',  '-N','.','R','.',  '-N','.','R','.',  'G','R','S','-N'],
        ['vak','-','trE','-',  'par','-','NE','-',  'dur','-','gE','-',  'na','ta','su','ra']),
      L(['S','.','G','.',  'S','.','G','.',  'S','R','G','M',  'P','.','.','.'],
        ['bRn','-','dE','-',  'sak','-','tE','-',  'gu','ru','gu','ha',  'pA','-','-','-']),
      L(['M','G','R','S',  'G','R','S','-N',  'S','.','.','.',  '.','.','.','.'],
        ['li','ni','ja','la',  'ru','ha','cha','ra',  'nE','-','-','-',  '-','-','-','-']),
      // Row 5: PDF correction — col 3 ends with N instead of kaarvai.
      L(['+S','.','N','D',  'P','.','M','.',  'G','.','M','.',  'P','.','D','N'],
        ['sun','-','da','ra',  'pAN','-','DyA','-',  'nan','-','dE','-',  'mA','-','yE','-']),
      L(['+S','.','N','D',  'P','.','M','.',  'P','.','.','.',  '.','.','.','.'],
        ['sU','-','ri','ja',  'nA','-','dhA','-',  'rE','-','-','-',  '-','-','-','-']),
      L(['+S','.','N','D',  'P','.','P','M',  'G','.','M','M',  'P','.','D','.'],
        ['sun','-','da','ra',  'rA','-','ja','sa',  'hO','-','da','ri',  'Gau','-','ri','-']),
      L(['M','G','R','S',  'G','R','S','-N',  'S','.','.','.',  '.','.','.','.'],
        ['Su','bha','ka','ri',  'sa','ta','ta','ma',  'ham','-','-','-',  '-','-','-','-']),
    ]},
  ],
}

// =========================================================================
// 7. Mucukunda Varada  (Tisram)
// =========================================================================
// Tisra-jathi tala. **Anya-swara**: this composition is famous for using
// shuddha rishabham (R₁) — NOT the standard chathushruthi R₂ of
// Sankarabharanam — in the descending "RRRRR" phrases that close lines 1
// and 3 ("sundara-kara" and "sundara-tara"). Per the source PDF and the
// user's correction, those five r's are encoded directly as "R1" so they
// bypass the raga's letter map and sound the shuddha pitch.
//
// Notation source: scanned page 5 (Samskriti Foundation), transcribed
// approximately — gamaka markings (shake, slide) shown in the PDF have
// been preserved as plain notes; a future pass can encode them.
const mucukundaVarada = {
  id: 'mucukunda',
  title: 'Mucukunda Varada',
  number: 7,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Tisram', jathi: 'Tisra', aksharas: 3 },
  cellsPerAvarta: 18,
  barsAt: [4, 9, 13],
  bigBarsAt: [18],
  meaning:
    'Boon-giver to Mucukunda — the king who slept in a cave for an age and was awakened by ' +
    'Krishna to incinerate Kalayavana with a glance. Salutations to Tyaga-raja, lovely-handed, ' +
    'lotus-faced, lord whose smile (manda-hāsa) gladdens the worlds — to Brahma-worshipped ' +
    'Guruguha, the auspicious one.',
  notes:
    'Uses shuddha rishabham (R₁) as anya-swara in the closing "sundara-kara" / "sundara-tara" ' +
    'phrases — a distinctive feature of this composition.',
  sections: [
    { label: 'Geetham', lines: [
      // Row 1 — eduppu (4 cells: rest, rest, mandara S, R) then main (5+4+5).
      L(['.','.','-S','R',   'G','G','G','R','G',   'P','M','M','G',   'R1','R1','R1','R1','R1'],
        ['-','-','mu','cu',  'kuṁ','da','va','ra','da',  'tyā','ga','rā','ja',  'suṁ','da','ra','ka','ra']),
      // Row 2 — pā-dā-ra | viṁ-da-sa-ra-sa | maṁ-da-hā-sa | va-da-na-ja-ya-vi
      L(['M','G','R',   '-S','S','S','-N','S',   'G','R','R','S',   '-N','-D','-P','-P','-D','-N'],
        ['pā','dā','ra',  'viṁ','da','sa','ra','sa',  'maṁ','da','hā','sa',  'va','da','na','ja','ya','vi']),
      // Row 3 (Charanam) — sustained S+pickup g | kuṁda-pūji | tāṁ-ga-dha-va-ḷa | sundara-tara (R₁×5)
      L(['S','.','.','G',   'P','G','P','G',   'D','-P','M','G','P',   'R1','R1','R1','R1','R1'],
        ['bhō','-','-','mu',  'kuṁ','da','pū','ji',  'tāṁ','ga','dha','va','ḷa',  'suṁ','da','ra','ta','ra']),
      // Row 4 — mirrors row 2 melodically with the closing "guruguha" sahitya.
      L(['M','G','R',   '-S','S','S','-N','S',   'G','R','R','S',   '-N','-D','-P','-P','-D','-N'],
        ['naṁ','dī','śa',  'naṁ','di','ta','su','ra',  'bṛṁ','da','vaṁ','di',  'ta','gu','ru','gu','ha','gu']),
      // Row 5 — final sustain on S.
      L(['S','.','.','.'],
        ['rō','-','-','-']),
    ]},
  ],
}

// =========================================================================
// 8. Kamalasana Vandita  (Adi)
// =========================================================================
// Adi tala layout. Notation source: Samskriti Foundation 2017 PDF (page 1
// notation, page 2 sahitya). The PDF uses a uppercase/lowercase visual
// convention for note duration that we collapse to plain madhya stayi here;
// dotted-below letters (ṇ, ḍ) are mandara stayi and encoded with the "-"
// prefix. Cell counts vary per row — bars show at the four PDF cell
// boundaries where they line up.
// Notation re-transcribed from the user's authoritative scan: 11 lines of
// 16 cells each (1 avarta of Adi at 2 cells per beat). The visible PDF
// rows pair up two avartas side-by-side; each col becomes one line here.
// Pallavi (4) + Anupallavi (3) + Charanam (4) = 11 lines.
const kamalasanaVandita = {
  id: 'kamalasana',
  title: 'Kamalasana Vandita',
  number: 8,
  composer: 'Muthuswami Dikshitar',
  language: 'Sanskrit',
  ragam: SANKARABHARANAM,
  talam: { name: 'Adi', jathi: 'Chathurasra', aksharas: 8 },
  cellsPerAvarta: 16,
  barsAt: [],
  bigBarsAt: [16],
  meaning:
    'Salutation to her at whose lotus feet Brahma (the lotus-seated, kamalAsana) bows — ' +
    'mother of Guruguha, dwelling in the heart of Vishnu (kamalA-pati), goddess of speech ' +
    '(vAgdEvi), Kamakshi, Kalyani, consort of Kameshvara.',
  sections: [
    { label: 'Pallavi', lines: [
      // Line 1 — kamalāsana vandita padābjē
      L(['P','M','G','.',  'G','M','R','.',  'R','G','S','.',  'S','.','S','.'],
        ['ka','ma','lā','-',  'sa','na','van','-',  'di','ta','pā','-',  'dāb','-','jē','-']),
      // Line 2 — kamanīya karōdaya sāmrājyē
      L(['R','G','M','.',  'M','P','G','.',  'G','M','R','.',  'R','.','R','.'],
        ['ka','ma','nī','-',  'ya','ka','rō','-',  'da','ya','sām','-',  'rāj','-','yē','-']),
      // Line 3 — kamalā nagarē sakalā kārē
      L(['P','M','G','.',  'G','M','R','.',  'R','G','S','.',  'S','.','S','.'],
        ['ka','ma','lā','-',  'na','ga','rē','-',  'sa','ka','lā','-',  'kā','-','rē','-']),
      // Line 4 — kamala nayana dhruta jagadā dhārē
      L(['R','G','M','G',  'R','S','N','S',  'R','G','S','.',  'S','.','S','.'],
        ['ka','ma','la','na',  'ya','na','dhr','ta',  'ja','ga','dā','-',  'dhā','-','rē','-']),
    ]},
    { label: 'Anupallavi', lines: [
      // Line 5 — kamalē vimalē guruguha janani
      // (Source PDF has "P M M G" struck out and "D P P M" written above
      // for cells 9–12; we apply the corrected D P P M phrase.)
      L(['P','M','G','.',  '+S','N','D','.',  'D','P','P','M',  'G','M','R','.'],
        ['ka','ma','lē','-',  'vi','ma','lē','-',  'gu','ru','gu','ha',  'ja','na','nī','-']),
      // Line 6 — kamalā pati nuta hrudayē māyē
      L(['P','M','G','.',  '+S','N','D','P',  'M','G','M','R',  'R','.','R','.'],
        ['ka','ma','lā','-',  'pa','ti','nu','ta',  'hr','da','yē','-',  'mā','-','yē','-']),
      // Line 7 — kamala saśi vijaya vadanē mēyē
      L(['P','M','G','P',  'M','G','R','M',  'G','R','S','.',  'S','.','S','.'],
        ['ka','ma','la','śa',  'śi','vi','ja','ya',  'va','da','nē','-',  'mē','-','yē','-']),
    ]},
    { label: 'Charanam', lines: [
      // Line 8 — kamalēndrāṇī vāgdēvī śrī
      L(['G','M','P','.',  'P','.','P','.',  '+S','.','P','.',  'P','.','P','.'],
        ['ka','ma','lēn','-',  'drā','-','ṇī','-',  'vāg','-','dē','-',  'vī','-','śrī','-']),
      // Line 9 — gourī pūjitē hrudayā nandē
      L(['+S','.','P','.',  'P','.','D','P',  'M','G','M','R',  'R','.','R','.'],
        ['gau','-','rī','-',  'pū','-','ji','ta',  'hr','da','yā','-',  'nan','-','dē','-']),
      // Line 10 — kamalākṣi pāhi kāmākṣi
      L(['G','M','P','.',  'P','.','P','.',  '+S','.','P','.',  'P','.','P','.'],
        ['ka','ma','lā','-',  'kṣi','-','pā','-',  'hi','-','kā','-',  'mā','-','kṣi','-']),
      // Line 11 — kāmēśvara vara sati kalyāṇi
      L(['+S','.','P','.',  'G','M','P','M',  'G','R','S','.',  'S','.','S','.'],
        ['kā','-','mēś','-',  'va','ra','va','ra',  'sa','ti','kal','-',  'yā','-','ṇi','-']),
    ]},
  ],
}

// ---------------------------------------------------------------------------
// History / Introduction page content (rendered before the first composition).
// ---------------------------------------------------------------------------
export const NOTTUSWARAM_INTRO = {
  id: '__intro__',
  title: 'Introduction to Nottuswarams',
  isIntro: true,
  // The intro page renders this rich content instead of a notation grid.
  history: {
    headline:
      'Western melodies, Sanskrit lyrics, and a beginner-friendly window into Dikshitar.',
    sections: [
      {
        heading: 'What are Nottuswarams?',
        body:
          'The Nottuswarams (also called "Nottuswara Sahityas") are a small set of compositions ' +
          'by Muthuswami Dikshitar (1775–1835) — one of the Trinity of Carnatic music. They are ' +
          'unique in the entire Carnatic repertoire because they take Western classical and ' +
          'British military-band tunes that Dikshitar heard in colonial Madras and dress them in ' +
          'Sanskrit devotional lyrics. Every nottuswaram is set in the ragam Sankarabharanam (the ' +
          '29th mela) — the Carnatic counterpart of the Western major scale — and they are sung ' +
          'WITHOUT the heavy gamakams that mark mainstream Carnatic, so the tunes preserve the ' +
          'original Western contour.',
      },
      {
        heading: 'Where does the name come from?',
        body:
          'The Tamil word "Nottu" is widely held to be a transliteration of the English "Note" — ' +
          'a direct reference to the staff-notated European tunes Dikshitar adapted. So ' +
          '"Nottuswaram" literally means "swaras of the (English) note". Some scholars trace ' +
          '"Nottu" further back to the Portuguese "Nota", since Portuguese sacred music had ' +
          'circulated in coastal South India for two centuries before the British arrived; ' +
          'others link it to the village band tradition of "Note bands" played at colonial ' +
          'parades, weddings, and church services. Either way, the name itself flags these as ' +
          'the "Western-note songs" of the Dikshitar canon.',
        note:
          'Pronunciation: say it as "NOTE-u swaram" (a soft, English "note") — NOT "nott-tu" ' +
          'with a retroflex doubled "tt". The Tamil spelling reflects the English source word, ' +
          'so the cleaner the "note" sound, the closer to the original.',
      },
      {
        heading: 'How did Dikshitar come to compose them?',
        body:
          'In the late 1790s, the young Muthuswami Dikshitar travelled to Manali (near Madras) ' +
          'with his patron Manali Chinnaiya Mudaliar. There he met European officers of Fort ' +
          "St. George and was exposed to British Army band music — fife, drum, and brass " +
          'pieces, hymns from the Anglican church, and popular Western airs of the day. The ' +
          'collector George Frederick Pohle (later patron of Dikshitar) is said to have ' +
          'specifically requested that Dikshitar set Sanskrit lyrics to these tunes so they ' +
          'could be sung in temple and home settings. Dikshitar obliged — preserving the ' +
          'melodic contour but writing entirely original devotional verses, mostly in praise ' +
          'of Ganesha, Shiva, Vishnu, Subrahmanya, Meenakshi, and Sri Rama.',
      },
      {
        heading: 'What is musically special about them?',
        body:
          "Three things stand out. First — NO GAMAKAMS. Carnatic music's identity is built on " +
          'gamakas (oscillating ornaments around each swara), but the nottuswarams are sung as ' +
          'plain notes (suddha-swara), exactly like Western melodies. Second — STRICT TALA. ' +
          'Each piece sits cleanly in Adi, Rupakam, Tisra-Adi, or Chaturashra Eka, with notes ' +
          'falling squarely on the beat — there is no rubato or anagatha-eduppu. Third — A ' +
          'RANGE A CHILD CAN SING. The melodies stay close to madhya stayi, with only brief ' +
          'excursions to mandara P or tara S, making them ideal for early-stage students.',
      },
      {
        heading: 'Why teach them after Geethams?',
        body:
          'After Sarali, Janta, and Alankaram drills, students traditionally move to Geethams ' +
          'for their first taste of singing words to a tune. Nottuswarams are the natural next ' +
          'step before tackling full-fledged Varnams and Krithis: the lyrics are real Sanskrit ' +
          'verses on Hindu deities, the talas span the most common four, but there are no ' +
          'gamakams to negotiate yet. Singing a nottuswaram cleanly trains the student in pitch ' +
          'accuracy, sahitya enunciation, and tala without the cognitive load of ornamentation ' +
          '— a perfect bridge from Geethams to the rest of the Carnatic repertoire.',
      },
      {
        heading: 'How many are there?',
        body:
          'About 33 nottuswarams have survived in the published Dikshitar corpus, though the ' +
          'most commonly taught set in beginner classes is a smaller core of roughly 6 to 8 ' +
          '("Syamale Meenakshi", "Santhatham Pahimam", "Sakthi Sahitha Ganapathim", "Vara Siva ' +
          'Balam", "Rama Janardhana", "Vande Meenakshi", and the famous "English Note"). This ' +
          'app collects those six core pieces, with the English Note to be added later — its ' +
          'extra anya-swaras (foreign notes) make it a natural follow-up once the rest are ' +
          'comfortable.',
      },
    ],
    facts: [
      { label: 'Composer', value: 'Muthuswami Dikshitar (1775–1835)' },
      { label: 'Ragam (all)', value: 'Sankarabharanam (29th mela)' },
      { label: 'Style', value: 'No gamakams — straight notes, like Western major scale' },
      { label: 'Language', value: 'Sanskrit (lyrics only — tunes are Western)' },
      { label: 'Total surviving', value: '~33 compositions' },
      { label: 'Talas used', value: 'Adi, Rupakam, Tisra-Adi, Chaturashra Eka' },
    ],
  },
}

// ---------------------------------------------------------------------------

export const NOTTUSWARAMS = [
  syamale,
  santhatham,
  sakthi,
  varaSivaBalam,
  ramaJanardhana,
  vandeMeenakshi,
  mucukundaVarada,
  kamalasanaVandita,
]

export function getNottuswaramById(id) {
  if (id === NOTTUSWARAM_INTRO.id) return NOTTUSWARAM_INTRO
  return NOTTUSWARAMS.find((n) => n.id === id) ?? NOTTUSWARAM_INTRO
}
