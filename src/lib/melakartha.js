// 72 Melakartha ragas, generated from Chakra rules.

export const CHAKRAS = [
  { idx: 0,  name: 'Indu',    meaning: 'Moon (1)' },
  { idx: 1,  name: 'Netra',   meaning: 'Eyes (2)' },
  { idx: 2,  name: 'Agni',    meaning: 'Fires (3)' },
  { idx: 3,  name: 'Veda',    meaning: 'Vedas (4)' },
  { idx: 4,  name: 'Bana',    meaning: 'Arrows (5)' },
  { idx: 5,  name: 'Rutu',    meaning: 'Seasons (6)' },
  { idx: 6,  name: 'Rishi',   meaning: 'Sages (7)' },
  { idx: 7,  name: 'Vasu',    meaning: 'Vasus (8)' },
  { idx: 8,  name: 'Brahma',  meaning: 'Brahmas (9)' },
  { idx: 9,  name: 'Disi',    meaning: 'Directions (10)' },
  { idx: 10, name: 'Rudra',   meaning: 'Rudras (11)' },
  { idx: 11, name: 'Aditya',  meaning: 'Adityas (12)' },
]

const RI_GA_PAIRS = [
  ['R1', 'G1'],
  ['R1', 'G2'],
  ['R1', 'G3'],
  ['R2', 'G2'],
  ['R2', 'G3'],
  ['R3', 'G3'],
]

const DA_NI_PAIRS = [
  ['D1', 'N1'],
  ['D1', 'N2'],
  ['D1', 'N3'],
  ['D2', 'N2'],
  ['D2', 'N3'],
  ['D3', 'N3'],
]

// Govinda / Thyagaraja (sampoorna) names — index 0 = raga 1.
export const GOVINDA_NAMES = [
  'Kanakangi','Ratnangi','Ganamurthi','Vanaspathi','Manavathi','Thanarupi',
  'Senavathi','Hanumathodi','Dhenuka','Natakapriya','Kokilapriya','Rupavathi',
  'Gayakapriya','Vakulabharanam','Mayamalavagowla','Chakravakam','Suryakantam','Hatakambari',
  'Jhankaradhwani','Natabhairavi','Keeravani','Kharaharapriya','Gowrimanohari','Varunapriya',
  'Mararanjani','Charukesi','Sarasangi','Harikambhoji','Dheerasankarabharanam','Naganandini',
  'Yagapriya','Ragavardhini','Gangeyabhushani','Vagadheeswari','Shulini','Chalanata',
  'Salagam','Jalarnavam','Jhalavarali','Navaneetham','Pavani','Raghupriya',
  'Gavambodhi','Bhavapriya','Subhapantuvarali','Shadvidhamargini','Suvarnangi','Divyamani',
  'Dhavalambari','Namanarayani','Kamavardhini','Ramapriya','Gamanashrama','Vishwambhari',
  'Shamalangi','Shanmukhapriya','Simhendramadhyamam','Hemavathi','Dharmavathi','Neethimathi',
  'Kantamani','Rishabhapriya','Latangi','Vachaspathi','Mechakalyani','Chitrambari',
  'Sucharitra','Jyothiswarupini','Dhatuvardhani','Nasikabhushani','Kosalam','Rasikapriya',
]

// Dikshitar / Asampoorna (Muthuswami Dikshitar tradition) names — parallel array.
export const DIKSHITAR_NAMES = [
  'Kanakambari','Phenadyuti','Ganasamavarali','Bhanumati','Manoranjani','Tanukirti',
  'Senagrani','Janatodi','Bhinnashadjam','Nattaibhairavi','Kokilaravam','Rupavati',
  'Geyahejjajji','Vatibasantabhairavi','Mayamalavagowla','Toyavegavahini','Chayavati','Jayasuddhamalavi',
  'Dhwijavanti','Natabharanam','Kiranavali','Sri','Gauriveluvali','Veeravasantam',
  'Sharavati','Tarangini','Saurasena','Harikedaragowla','Sankarabharanam','Nagabharanam',
  'Kalavati','Ragachudamani','Gangatarangini','Bhogachayanata','Sailadesakshi','Chayanata',
  'Saugandhini','Jaganmohanam','Dhalivarali','Nabhomani','Kumbhini','Ravikriya',
  'Girvani','Bhavani','Shivapantuvarali','Stavarajam','Sauveeram','Jeevantika',
  'Dhavalangam','Narmada','Kashiramakriya','Ramamanohari','Gamakakriya','Vamshavati',
  'Shyamalam','Chamaram','Sumadyuti','Desisimharavam','Dhamavati','Nishadham',
  'Kuntala','Kusumakaram','Geetapriya','Bhushavati','Kalyani','Chaturangini',
  'Santanamanjari','Jyotiragam','Dhautapanchamam','Nadatarangini','Kusumakaram','Rasamanjari',
]

// Build a single raga record for melakartha number n in [1..72].
export function buildRaga(n) {
  if (n < 1 || n > 72) throw new Error(`Raga number out of range: ${n}`)
  const chakraIdx = Math.floor((n - 1) / 6)
  const positionInChakra = ((n - 1) % 6) + 1
  const ma = n <= 36 ? 'M1' : 'M2'
  const half = (n - 1) % 36
  const [ri, ga] = RI_GA_PAIRS[Math.floor(half / 6)]
  const [da, ni] = DA_NI_PAIRS[half % 6]

  const arohanam = ['S', ri, ga, ma, 'P', da, ni, "S'"]
  const avarohanam = [...arohanam].reverse()

  return {
    number: n,
    name: GOVINDA_NAMES[n - 1],
    dikshitarName: DIKSHITAR_NAMES[n - 1],
    chakra: CHAKRAS[chakraIdx],
    chakraIdx,
    positionInChakra,
    madhyamam: ma,
    swaras: { ri, ga, ma, da, ni },
    arohanam,
    avarohanam,
  }
}

// All 72 ragas.
export const RAGAS = Array.from({ length: 72 }, (_, i) => buildRaga(i + 1))

// Group into 12 chakras of 6 ragas.
export const CHAKRA_GROUPS = CHAKRAS.map((c) => ({
  ...c,
  ragas: RAGAS.filter((r) => r.chakraIdx === c.idx),
}))
