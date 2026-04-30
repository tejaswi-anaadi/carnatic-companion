// src/lib/devanagari.js
// Devanagari (Sanskrit-script) translations of every label that the
// Carnatic Companion app surfaces in its UI.
//
// Primary sources (cross-checked):
//   - Hindi Wikipedia, "मेलकर्ता" — canonical chakra-by-chakra list of all 72
//     Govinda/sampoorna names. (Authoritative for #1-72 in GOVINDA_DEVANAGARI.)
//   - English Wikipedia, "Asampurna Melakarta" — name list cross-checked
//     against the asampoornaScales.js entries.
//   - Subbarama Dikshitar, Sangita Sampradaya Pradarshini (1904) — for
//     asampoorna name confirmation where Wikipedia and Karnatik.com
//     disagree (e.g. Senagrani, Jhankarabhramari, Nadatarangini).
//   - Karnatik.com & Shadjam.wordpress.com — Sanskrit-aware spellings of
//     swara, tala and anga vocabulary.
//   - Apte / Monier-Williams Sanskrit dictionaries — for terminology
//     (आरोहण, अवरोहण, मेल, पूर्वाङ्ग, etc.).
//
// Conventions used in this file:
//   - Word-final ् (virama) is preserved on Sanskrit -m and consonant
//     endings (e.g. आरोहणम्, गानमूर्तिः → आरोहणम्/गानमूर्ति, अनुद्रुतम्).
//   - Anusvara (ं) is used before velars/palatals when that's the form
//     attested in Hindi Wikipedia's मेलकर्ता article (e.g. कनकांगि rather
//     than कनकाङ्गी). This matches the most common spelling South Indian
//     publications use in Devanagari today; conjunct forms (ङ्ग, ञ्च) are
//     also acceptable Sanskrit and noted inline where relevant.
//   - Retroflex ळ (Tamil/Dravidian "la") is preserved where the Hindi-
//     Wikipedia source uses it (e.g. मायामाळवगौळ, झालवराळि, मेचकळ्याणि) —
//     this is the form actually used in printed South Indian Sanskrit.
//   - Subscript digits ₁ ₂ ₃ are used on swara variants to mirror the
//     existing SWARA_LABEL convention in src/lib/swaras.js.
//
// See DEVANAGARI_SOURCES.md for ambiguous spellings and how each was
// resolved.

// -----------------------------------------------------------------------------
// 72 Govinda / sampoorna mela names (parallel to GOVINDA_NAMES in melakartha.js)
// Source: hi.wikipedia.org/wiki/मेलकर्ता (chakra tables).
// -----------------------------------------------------------------------------
export const GOVINDA_DEVANAGARI = [
  // Indu chakra (1-6)
  'कनकांगि',        // 1  Kanakangi      (also written कनकाङ्गी)
  'रत्नांगि',         // 2  Ratnangi       (also रत्नाङ्गी)
  'गानमूर्ति',        // 3  Ganamurthi
  'वनस्पति',        // 4  Vanaspathi
  'मानवति',        // 5  Manavathi
  'तानरूपि',        // 6  Thanarupi
  // Netra chakra (7-12)
  'सेनावति',        // 7  Senavathi
  'हनुमतोडि',       // 8  Hanumathodi
  'धेनुक',          // 9  Dhenuka
  'नाटकप्रिय',      // 10 Natakapriya
  'कोकिलप्रिय',     // 11 Kokilapriya
  'रूपावति',        // 12 Rupavathi
  // Agni chakra (13-18)
  'गायकप्रिय',      // 13 Gayakapriya
  'वकुळाभरणम्',    // 14 Vakulabharanam   (vakulābharaṇam; ळ retroflex)
  'मायामाळवगौळ',   // 15 Mayamalavagowla  (māyāmāḷavagauḷa)
  'चक्रवाकम्',      // 16 Chakravakam
  'सूर्यकान्तम्',     // 17 Suryakantam
  'हटकांबरि',       // 18 Hatakambari    (also हाटकाम्बरी)
  // Veda chakra (19-24)
  'झंकारध्वनि',     // 19 Jhankaradhwani
  'नाटभैरवि',       // 20 Natabhairavi
  'कीरवाणि',        // 21 Keeravani
  'खरहरप्रिय',      // 22 Kharaharapriya
  'गौरीमनोहरि',    // 23 Gowrimanohari
  'वरुणप्रिय',       // 24 Varunapriya
  // Bana chakra (25-30)
  'माररंजनि',       // 25 Mararanjani
  'चारुकेशि',        // 26 Charukesi
  'सरसांगि',        // 27 Sarasangi
  'हरिकांभोजि',     // 28 Harikambhoji
  'धीरशंकराभरणम्', // 29 Dheerasankarabharanam
  'नागानंदिनि',     // 30 Naganandini
  // Rutu chakra (31-36)
  'यागप्रिय',       // 31 Yagapriya
  'रागवर्धनि',       // 32 Ragavardhini
  'गांगेयभूषिणि',    // 33 Gangeyabhushani
  'वागधीश्वरि',     // 34 Vagadheeswari
  'शूलिनि',         // 35 Shulini
  'चलनत',          // 36 Chalanata     (also चलनाट)
  // Rishi chakra (37-42)
  'सालगम्',         // 37 Salagam
  'जलार्णवम्',      // 38 Jalarnavam
  'झालवराळि',      // 39 Jhalavarali
  'नवनीतम्',        // 40 Navaneetham
  'पावनि',          // 41 Pavani
  'रघुप्रिय',         // 42 Raghupriya
  // Vasu chakra (43-48)
  'गवांबोधि',       // 43 Gavambodhi
  'भवप्रिय',        // 44 Bhavapriya
  'शुभपंतुवराळि',   // 45 Subhapantuvarali
  'षड्विधमार्गिणि', // 46 Shadvidhamargini
  'सुवर्णांगि',       // 47 Suvarnangi
  'दिव्यमणि',       // 48 Divyamani
  // Brahma chakra (49-54)
  'धवळांबरि',       // 49 Dhavalambari
  'नामनारायणि',    // 50 Namanarayani
  'कामवर्धनि',      // 51 Kamavardhini   (= पंतुवराळि / Pantuvarali)
  'रामप्रिय',        // 52 Ramapriya
  'गमनाश्रम',       // 53 Gamanashrama
  'विश्वंबरि',       // 54 Vishwambhari
  // Disi chakra (55-60)
  'श्यामलांगि',     // 55 Shamalangi
  'षण्मुखप्रिय',    // 56 Shanmukhapriya
  'सिंहेंद्रमध्यमम्',// 57 Simhendramadhyamam
  'हेमावति',        // 58 Hemavathi
  'धर्मावति',        // 59 Dharmavathi
  'नीतिमति',        // 60 Neethimathi
  // Rudra chakra (61-66)
  'कांतामणि',       // 61 Kantamani
  'रिषभप्रिय',      // 62 Rishabhapriya  (also ऋषभप्रिय)
  'लतांगि',          // 63 Latangi
  'वाचस्पति',       // 64 Vachaspathi
  'मेचकळ्याणि',    // 65 Mechakalyani   (mechakaḷyāṇi)
  'चित्रांबरि',       // 66 Chitrambari
  // Aditya chakra (67-72)
  'सुचरित्र',         // 67 Sucharitra
  'ज्योतिस्वरूपिणि',// 68 Jyothiswarupini
  'धातुवर्धनि',      // 69 Dhatuvardhani
  'नासिकाभूषिणि', // 70 Nasikabhushani
  'कोसलम्',        // 71 Kosalam
  'रसिकप्रिय',      // 72 Rasikapriya
]

// -----------------------------------------------------------------------------
// 72 Asampoorna / Dikshitar mela names — parallel to ASAMPOORNA_SCALES[n].name
// in src/lib/asampoornaScales.js.
// Source: en.wikipedia.org/wiki/Asampurna_Melakarta cross-checked with
// Subbarama Dikshitar's Sangita Sampradaya Pradarshini (1904).
// -----------------------------------------------------------------------------
export const DIKSHITAR_DEVANAGARI = [
  'कनकांबरि',         // 1  Kanakambari
  'फेनद्युति',          // 2  Phenadyuti
  'गानसामवराळि',     // 3  Ganasamavarali
  'भानुमति',           // 4  Bhanumati
  'मनोरंजनि',          // 5  Manoranjani
  'तनुकीर्ति',           // 6  Tanukirti
  'सेनाग्रणि',          // 7  Senagrani
  'जनतोडि',           // 8  Janatodi
  'धुनिभिन्नषड्जम्',  // 9  Dhunibhinnashadjam
  'नाटाभरणम्',        // 10 Natabharanam
  'कोकिलारवम्',       // 11 Kokilaravam
  'रूपावति',           // 12 Rupavati
  'गेयहेज्जज्जि',       // 13 Geyahejjajji
  'वाटीवसन्तभैरवि',   // 14 Vatibasantabhairavi  (also वायुवसन्तभैरवि)
  'मायामाळवगौळ',    // 15 Mayamalavagowla
  'तोयवेगवाहिनि',    // 16 Toyavegavahini       (= तपोवेगवाहिनि per SD)
  'छायावति',          // 17 Chayavati
  'जयशुद्धमालवि',    // 18 Jayasuddhamalavi
  'झंकारभ्रमरि',      // 19 Jhankarabhramari
  'नारीरीतिगौल',      // 20 Nariritigaula        (also नारीरीतिगौळ)
  'किरणावलि',         // 21 Kiranavali
  'श्री',                // 22 Sri  (श्रीरागः)
  'गौरीवेळावळि',     // 23 Gauriveluvali
  'वीरवसन्तम्',       // 24 Veeravasantam
  'शरावति',           // 25 Sharavati
  'तरंगिणि',           // 26 Tarangini
  'सौरसेन',            // 27 Saurasena
  'हरिकेदारगौळ',     // 28 Harikedaragowla
  'शंकराभरणम्',     // 29 Sankarabharanam
  'नागाभरणम्',      // 30 Nagabharanam
  'कलावति',          // 31 Kalavati
  'रागचूडामणि',     // 32 Ragachudamani
  'गंगातरंगिणि',     // 33 Gangatarangini
  'भोगछायानाट',     // 34 Bhogachayanata
  'शैलदेशाक्षि',       // 35 Sailadesakshi
  'छायानाट',         // 36 Chayanata
  'सौगंधिनि',         // 37 Saugandhini
  'जगन्मोहनम्',      // 38 Jaganmohanam
  'धालिवराळि',      // 39 Dhalivarali
  'नभोमणि',          // 40 Nabhomani
  'कुम्भिनि',          // 41 Kumbhini
  'रविक्रिया',         // 42 Ravikriya
  'गीर्वाणि',           // 43 Girvani
  'भवानि',            // 44 Bhavani
  'शिवपन्तुवराळि',  // 45 Shivapantuvarali
  'स्तवराजम्',        // 46 Stavarajam
  'सौवीरम्',           // 47 Sauveeram
  'जीवन्तिका',        // 48 Jeevantika
  'धवळांगम्',         // 49 Dhavalangam
  'नर्मदा',             // 50 Narmada              (Wikipedia: नामदेसि)
  'काशीरामक्रिया',  // 51 Kashiramakriya
  'राममनोहरि',      // 52 Ramamanohari
  'गमकक्रिया',       // 53 Gamakakriya
  'वंशवति',           // 54 Vamshavati
  'श्यामलम्',          // 55 Shyamalam
  'चामरम्',           // 56 Chamaram
  'सुमद्युति',         // 57 Sumadyuti
  'देशीसिंहारवम्',   // 58 Desisimharavam
  'धामवति',          // 59 Dhamavati
  'निषादम्',          // 60 Nishadham
  'कुन्तल',             // 61 Kuntala
  'कुसुमाकरम्',      // 62 Kusumakaram          (also रतिप्रिय in some tables)
  'गीतप्रिय',          // 63 Geetapriya
  'भूषावति',           // 64 Bhushavati
  'कल्याणि',          // 65 Kalyani              (= शान्तकल्याणि per SD)
  'चतुरंगिणि',        // 66 Chaturangini
  'सन्तानमंजरि',     // 67 Santanamanjari
  'ज्योतिरागम्',      // 68 Jyotiragam           (Wikipedia: ज्योति)
  'धौतपञ्चमम्',     // 69 Dhautapanchamam
  'नादतरंगिणि',     // 70 Nadatarangini        (Wikipedia table: नासमणि)
  'कुसुमाकरम्',      // 71 Kusumakaram          (duplicates #62 in SD's list)
  'रसमंजरि',         // 72 Rasamanjari
]

// -----------------------------------------------------------------------------
// The 12 Chakras (parallel to CHAKRAS in melakartha.js, idx 0-11).
// -----------------------------------------------------------------------------
export const CHAKRA_DEVANAGARI = [
  'इन्दु',     // 1  Indu     — moon
  'नेत्र',     // 2  Netra    — eyes
  'अग्नि',    // 3  Agni     — fires
  'वेद',      // 4  Veda     — vedas
  'बाण',     // 5  Bana     — arrows
  'ऋतु',     // 6  Rutu     — seasons
  'ऋषि',    // 7  Rishi    — sages
  'वसु',      // 8  Vasu     — vasus
  'ब्रह्म',    // 9  Brahma   — brahmas
  'दिशि',    // 10 Disi     — directions (also दिक्/दिशा)
  'रुद्र',     // 11 Rudra    — rudras
  'आदित्य', // 12 Aditya   — adityas
]

// Map keyed by English chakra name as used in CHAKRAS:
export const CHAKRA_DEVANAGARI_BY_NAME = {
  Indu: 'इन्दु',
  Netra: 'नेत्र',
  Agni: 'अग्नि',
  Veda: 'वेद',
  Bana: 'बाण',
  Rutu: 'ऋतु',
  Rishi: 'ऋषि',
  Vasu: 'वसु',
  Brahma: 'ब्रह्म',
  Disi: 'दिशि',
  Rudra: 'रुद्र',
  Aditya: 'आदित्य',
}

// -----------------------------------------------------------------------------
// Suladi Sapta Tala family names.
// Sources: standard Sanskrit grammar of these terms; cross-checked with
// Carnatic-music glossaries (angelfire/mridhangam, Karnatik.com).
// -----------------------------------------------------------------------------
export const TALA_FAMILIES_DEVANAGARI = {
  Dhruva: 'ध्रुव',
  Matya: 'मठ्य', // also seen as मट्य; मठ्य is the spelling in Sanskrit treatises
  Rupaka: 'रूपक',
  Jhampa: 'झम्प', // also झम्पा
  Triputa: 'त्रिपुट',
  Ata: 'अट',     // also आट; अट is the standard Sanskrit form
  Eka: 'एक',
}

// -----------------------------------------------------------------------------
// Jathi names (used as the laghu count in Suladi Sapta Tala).
// Standard Sanskrit ordinals/numerical adjectives.
// -----------------------------------------------------------------------------
export const JATHI_DEVANAGARI = {
  Tisra: 'तिस्र',     // 3 — also त्रिस्र
  Chatusra: 'चतुस्र',// 4 — also चतुरस्र
  Khanda: 'खण्ड',   // 5
  Misra: 'मिश्र',     // 7
  Sankirna: 'सङ्कीर्ण', // 9 — also संकीर्ण
}

// Nadai / Gati uses the same five names.
export const NADAI_DEVANAGARI = { ...JATHI_DEVANAGARI }

// -----------------------------------------------------------------------------
// Anga (component) names of a tala.
// -----------------------------------------------------------------------------
export const ANGA_DEVANAGARI = {
  Anudrutam: 'अनुद्रुतम्',
  Drutam: 'द्रुतम्',
  Laghu: 'लघु',
}

// -----------------------------------------------------------------------------
// Swara — single-syllable abbreviations (matches SWARA_LABEL in swaras.js).
// Subscripts ₁ ₂ ₃ mark the variant index, as in the existing UI.
// -----------------------------------------------------------------------------
export const SWARA_DEVANAGARI = {
  S: 'स',
  "S'": 'सं', // upper-octave Sa — anusvara mark for tara-sthayi
  R1: 'रि₁', R2: 'रि₂', R3: 'रि₃',
  G1: 'ग₁',  G2: 'ग₂',  G3: 'ग₃',
  M1: 'म₁',  M2: 'म₂',
  P: 'प',
  D1: 'ध₁',  D2: 'ध₂',  D3: 'ध₃',
  N1: 'नि₁', N2: 'नि₂', N3: 'नि₃',
}

// -----------------------------------------------------------------------------
// Swara — full Sanskrit names with shuddha / chatushruti / shatshruti /
// sadharana / antara / kaisiki / kakali qualifiers per the 16-svara scheme
// (Venkatamakhi, Chaturdandi Prakashika).
// -----------------------------------------------------------------------------
export const SWARA_FULL_DEVANAGARI = {
  S:  'षड्ज',
  "S'": 'तार षड्ज',
  R1: 'शुद्ध ऋषभ',
  R2: 'चतुश्रुति ऋषभ',
  R3: 'षट्श्रुति ऋषभ',
  G1: 'शुद्ध गान्धार',
  G2: 'साधारण गान्धार',
  G3: 'अन्तर गान्धार',
  M1: 'शुद्ध मध्यम',
  M2: 'प्रति मध्यम',
  P:  'पञ्चम',
  D1: 'शुद्ध धैवत',
  D2: 'चतुश्रुति धैवत',
  D3: 'षट्श्रुति धैवत',
  N1: 'शुद्ध निषाद',
  N2: 'कैशिकी निषाद',
  N3: 'काकली निषाद',
}

// -----------------------------------------------------------------------------
// General terminology used across the UI.
// Keys exactly match the English label as it appears in the codebase.
// -----------------------------------------------------------------------------
export const TERMS_DEVANAGARI = {
  // Scale-structure terminology
  Arohanam: 'आरोहणम्',
  Avarohanam: 'अवरोहणम्',
  Mela: 'मेल',
  Melakartha: 'मेलकर्ता',
  Melakarta: 'मेलकर्ता',
  Sampoorna: 'सम्पूर्ण',
  Asampoorna: 'असम्पूर्ण',
  Sampurna: 'सम्पूर्ण',
  Asampurna: 'असम्पूर्ण',
  Audava: 'औडव',     // 5-note
  Shadava: 'षाडव',   // 6-note
  Vakra: 'वक्र',
  Janya: 'जन्य',
  Janaka: 'जनक',
  'Suddha Madhyama': 'शुद्ध मध्यम',
  'Shuddha Madhyama': 'शुद्ध मध्यम',
  'Prati Madhyama': 'प्रति मध्यम',
  Poorvanga: 'पूर्वाङ्ग',
  Uttaranga: 'उत्तराङ्ग',
  Raga: 'राग',
  Ragam: 'रागम्',
  Kriti: 'कृति',

  // Tala-system terminology
  Tala: 'ताल',
  Talam: 'तालम्',
  Chakra: 'चक्र',
  Jathi: 'जाति',
  Nadai: 'नडै', // Tamil-derived; also written as Sanskrit नटन / नर्तन ≠ Carnatic gati
  Gati: 'गति',
  Anga: 'अङ्ग',
  Aksharam: 'अक्षरम्',
  Avartam: 'आवर्तम्',
  Cycle: 'आवर्तम्',
  Beat: 'मात्रा',
  BPM: 'मात्रा/मिनट',
  Tempo: 'लय',
  'Suladi Sapta Tala': 'सूळादि सप्त ताल', // Kannada-derived "suḻādi" → सूळादि

  // Hand-gesture vocabulary used in the Tala visualizer
  Clap: 'ताडन',          // ताडन = strike/clap; "ताली" is the colloquial Hindi term
  Wave: 'हस्तविसर्जन',    // hand-release; "वीचि" sometimes used for "wave" in dance
  Finger: 'अङ्गुलि',
  'Finger count': 'अङ्गुलिगणना',
  Beats: 'मात्राः',

  // Misc UI vocabulary
  Composer: 'वाग्गेयकार',
  Trinity: 'त्रिमूर्ति',
  History: 'इतिहास',
  Tools: 'साधनम्',
  Tuner: 'स्वरमापक',
  Metronome: 'लयमापक',
  Drone: 'श्रुति',
  Shruti: 'श्रुति',
  Tambura: 'तम्बूरा',
  Tampura: 'तम्बूरा',
}

// -----------------------------------------------------------------------------
// Trinity composer names (for the History view).
// -----------------------------------------------------------------------------
export const COMPOSERS_DEVANAGARI = {
  Tyagaraja: 'त्यागराज',
  'Sri Tyagaraja Swami': 'श्री त्यागराज स्वामी',
  'Muthuswami Dikshitar': 'मुत्तुस्वामी दीक्षितर्',
  'Sri Muthuswami Dikshitar': 'श्री मुत्तुस्वामी दीक्षितर्',
  'Syama Sastri': 'श्यामा शास्त्री',
  'Sri Syama Sastri': 'श्री श्यामा शास्त्री',
  // Earlier figures sometimes referenced
  Purandaradasa: 'पुरन्दरदास',
  Venkatamakhi: 'वेङ्कटमखी',
  Govindacharya: 'गोविन्दाचार्य',
  'Subbarama Dikshitar': 'सुब्बराम दीक्षितर्',
}

// -----------------------------------------------------------------------------
// Towns referenced in trinityData.js → pilgrimage entries.
// Many are Tamil place-names; the Devanagari spellings below follow the
// transliteration used in Hindi Wikipedia articles for each town.
// -----------------------------------------------------------------------------
export const TOWNS_DEVANAGARI = {
  Tiruvarur: 'तिरुवारूर्',
  Tiruvaiyaru: 'तिरुवैयारु',
  Tanjavur: 'तंजावूर',
  Thanjavur: 'तंजावूर',
  Madurai: 'मदुरै',
  Kanchipuram: 'काञ्चीपुरम्',
  Varanasi: 'वाराणसी',
  Tirupati: 'तिरुपति',
  Kovur: 'कोवूर्',
  Lalgudi: 'लालगुडि',
  Srirangam: 'श्रीरङ्गम्',
  Vaitheeswarankoil: 'वैद्येश्वरन्कोयिल्',
  Chidambaram: 'चिदम्बरम्',
  Ettayapuram: 'एट्टयापुरम्',
  Tiruttani: 'तिरुत्तणि',
  Tiruvannamalai: 'तिरुवण्णामलै',
  Tiruvanaikaval: 'तिरुवानैक्कावल्',
  Nagapattinam: 'नागपट्टिनम्',
  // Tamil Nadu state name (sometimes appended)
  'Tamil Nadu': 'तमिऴ्नाडु',
}

// -----------------------------------------------------------------------------
// Temple names referenced in trinityData.js. Map of full English label →
// Devanagari. Keys must exactly match the strings used in trinityData.js.
// -----------------------------------------------------------------------------
export const TEMPLES_DEVANAGARI = {
  // Tyagaraja's pilgrimage
  'Thyagaraja Temple': 'त्यागराज मन्दिर',
  'Panchanatheeswarar': 'पञ्चनतीश्वर',
  'Kovur Sundareswarar': 'कोवूर् सुन्दरेश्वर',
  'Lalgudi Saptarishiswara': 'लालगुडि सप्तर्षीश्वर',
  'Sriranganathaswamy': 'श्रीरङ्गनाथस्वामी',
  'Tirupati Venkateswara': 'तिरुपति वेङ्कटेश्वर',
  'Varadaraja Perumal': 'वरदराज पेरुमाळ्',
  Sundareswarar: 'सुन्दरेश्वर',

  // Dikshitar's pilgrimage
  'Kashi Vishwanath': 'काशी विश्वनाथ',
  'Meenakshi Amman': 'मीनाक्षी अम्मन्',
  'Ekambareswarar': 'एकाम्बरेश्वर',
  'Vaitheeswaran Koil': 'वैद्येश्वरन् कोयिल्',
  'Chidambaram Nataraja': 'चिदम्बरम् नटराज',
  'Ettayapuram Subramania': 'एट्टयापुरम् सुब्रह्मण्य',
  'Subrahmanya Swami': 'सुब्रह्मण्यस्वामी',
  Arunachaleswarar: 'अरुणाचलेश्वर',
  Jambukeswarar: 'जम्बुकेश्वर',

  // Syama Sastri's pilgrimage
  'Bangaru Kamakshi': 'बङ्गारु कामाक्षी',
  'Kamakshi Amman': 'कामाक्षी अम्मन्',
  'Brihadeeswarar': 'बृहदीश्वर',
}

// -----------------------------------------------------------------------------
// Helper: look up a Devanagari translation for any English label, falling
// back to the original input when no mapping exists.
// -----------------------------------------------------------------------------
export function toDevanagari(label, dictionaries = [
  TERMS_DEVANAGARI,
  ANGA_DEVANAGARI,
  JATHI_DEVANAGARI,
  TALA_FAMILIES_DEVANAGARI,
  COMPOSERS_DEVANAGARI,
  TOWNS_DEVANAGARI,
  TEMPLES_DEVANAGARI,
  CHAKRA_DEVANAGARI_BY_NAME,
  SWARA_DEVANAGARI,
  SWARA_FULL_DEVANAGARI,
]) {
  if (label == null) return label
  for (const dict of dictionaries) {
    if (Object.prototype.hasOwnProperty.call(dict, label)) return dict[label]
  }
  return label
}

// Look up the Devanagari name of a melakartha by its 1-based number.
export function govindaDevanagari(n) {
  if (n < 1 || n > 72) return null
  return GOVINDA_DEVANAGARI[n - 1]
}
export function dikshitarDevanagari(n) {
  if (n < 1 || n > 72) return null
  return DIKSHITAR_DEVANAGARI[n - 1]
}
