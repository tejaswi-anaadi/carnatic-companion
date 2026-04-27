# Devanagari Translation Sources

This document records the authority used for every Devanagari (Sanskrit-script)
spelling in `src/lib/devanagari.js`. It is intended as a paper trail for
auditors / future contributors who need to verify or correct individual
entries.

## (a) Primary Sources

| Domain | Source | Used for |
|---|---|---|
| 72 sampoorna mela names | **Hindi Wikipedia, [`मेलकर्ता`](https://hi.wikipedia.org/wiki/मेलकर्ता)** — chakra-by-chakra table | All entries in `GOVINDA_DEVANAGARI`. This is the most rigorously edited public Devanagari list of the 72 melas; it follows printed South Indian Sanskrit conventions (anusvara before velars; retroflex ळ where attested). |
| 72 asampoorna mela names | **English Wikipedia, [`Asampurna Melakarta`](https://en.wikipedia.org/wiki/Asampurna_Melakarta)** + cross-check against **Subbarama Dikshitar, *Sangita Sampradaya Pradarshini* (1904)** | All entries in `DIKSHITAR_DEVANAGARI`. Roman names are taken directly from `asampoornaScales.js` (which already cites SSP); Devanagari forms applied per standard Sanskrit transliteration of those Roman names. |
| Suladi Sapta Tala vocabulary | Standard Sanskrit treatises on tala (Sangita Ratnakara, Sangita Sampradaya Pradarshini); Carnatic glossary at **angelfire.com/mb/mridhangam/glossary** and **karnatic.com** | `TALA_FAMILIES_DEVANAGARI`, `JATHI_DEVANAGARI`, `NADAI_DEVANAGARI`, `ANGA_DEVANAGARI`. |
| 16-svara nomenclature | **Venkatamakhi, *Chaturdandi Prakashika*** (1660); reproduced in every modern Carnatic textbook (e.g. P. Sambamoorthy, *South Indian Music* vol. I) | `SWARA_DEVANAGARI`, `SWARA_FULL_DEVANAGARI`. |
| Trinity composer names | **Hindi Wikipedia [`त्यागराज`](https://hi.wikipedia.org/wiki/त्यागराज)** and search results citing the Trinity in Devanagari | `COMPOSERS_DEVANAGARI`. |
| Town / temple names | **Hindi Wikipedia** articles on each town (तिरुवारूर्, मदुरै, तिरुपति, etc.); Tamil-derived place-names follow the spelling Hindi Wikipedia uses for each town | `TOWNS_DEVANAGARI`, `TEMPLES_DEVANAGARI`. |
| General Sanskrit terminology | **Apte's *Practical Sanskrit-English Dictionary***; **Monier-Williams** | `TERMS_DEVANAGARI` (`आरोहणम्`, `अवरोहणम्`, `पूर्वाङ्ग`, `उत्तराङ्ग`, `मात्रा`, `आवर्तम्`, `लय`, etc.). |

## (b) Ambiguous Spellings — How Each Was Resolved

| English | Chosen | Alternate(s) | Reasoning |
|---|---|---|---|
| Kanakangi | कनकांगि | कनकाङ्गी | Hindi Wikipedia uses the anusvara form. Both are valid Sanskrit; the anusvara form is what South Indian Devanagari publications print today. |
| Mayamalavagowla | मायामाळवगौळ | मायामालवगौला | The retroflex ळ matches how Tamil/Kannada/Telugu sources transcribe the original ḷa; this is preserved from the Hindi Wikipedia table. |
| Mechakalyani | मेचकळ्याणि | मेचकल्याणी | Same retroflex-ळ rationale. Hindi Wikipedia uses मेचकळ्याणि. |
| Jhalavarali | झालवराळि | झालवराली | Hindi Wikipedia retroflex form. |
| Subhapantuvarali | शुभपंतुवराळि | शुभपन्तुवराळि | Anusvara वs. nasal conjunct — both attested; followed Hindi Wikipedia. |
| Pantuvarali / Kamavardhini | कामवर्धनि | पंतुवराळि | Mela #51's official Govinda name is Kamavardhini; the popular name "Pantuvarali" is noted inline. |
| Hatakambari | हटकांबरि | हाटकाम्बरी | Hindi Wikipedia spelling preferred over the Sanskritised long-vowel form. |
| Matya tala | मठ्य | मट्य, माठ्य | मठ्य is the form in Sanskrit treatises (Sangita Ratnakara). |
| Ata tala | अट | आट | अट is the standard Sanskrit form; आट is a Tamil-influenced alternate. |
| Sankirna | सङ्कीर्ण | संकीर्ण | Conjunct preserved (matches the अङ्ग / अञ्ज / etc. pattern used elsewhere in the file). |
| Tisra | तिस्र | त्रिस्र, त्र्यश्र | तिस्र is the form used in tala literature. |
| Chatusra | चतुस्र | चतुरस्र | चतुस्र is the contracted form universally used in tala-laghu nomenclature. |
| Suladi Sapta Tala | सूळादि सप्त ताल | सूलादि / सूळादि | The word "suḻādi" is Kannada in origin; ळ retroflex preserved. |
| Senagrani | सेनाग्रणि | सेनाग्रणी | Final short ि matches the file's convention for raga names ending in -ī. |
| Jhankarabhramari (#19 Dikshitar) | झंकारभ्रमरि | धूविजवन्ति | The asampoornaScales.js file notes Subbarama Dikshitar uses Jhankarabhramari for #19, not Dhwijavanti — Devanagari follows that. |
| Nadatarangini (#70) | नादतरंगिणि | नासमणि | Wikipedia's table prints "Nasamani" but SSP uses Nadatarangini; we follow SSP, matching `asampoornaScales.js`. |
| Narmada (#50) | नर्मदा | नामदेसि | SSP and `asampoornaScales.js` use Narmada; Wikipedia table has Namadeshi. |
| Tyagaraja | त्यागराज | त्यागराजः | Visarga (ः) dropped because the codebase consistently shows composer names without case-endings. |
| Muthuswami Dikshitar | मुत्तुस्वामी दीक्षितर् | मुत्तुस्वामि दीक्षितः | `दीक्षितर्` (with virama-र्) is the Tamil/South Indian Sanskrit honorific suffix actually used; matches every published Carnatic source. |
| Syama Sastri | श्यामा शास्त्री | श्यामशास्त्री | The "ā" ending of Shyāmā is preserved per Hindi Wikipedia. |
| Tiruvarur | तिरुवारूर् | तिरुवारुर | Final virama preserved (Tamil-derived word ending in consonant). |
| Madurai | मदुरै | मधुरा | मदुरै follows the Tamil pronunciation (the city is मधुरा/Mathura only in Sanskritised Puranic context). |
| Tamil Nadu | तमिऴ्नाडु | तमिलनाडु | Retroflex ऴ preserved. |
| Kanchipuram | काञ्चीपुरम् | कांचीपुरम् | Conjunct ञ्च preferred for Sanskrit place name. |

## (c) Items Where No Single Authoritative Source Was Found

The following entries are best-guess transliterations. They are flagged here
so they can be revised if a more authoritative source surfaces:

1. **"Wave" hand gesture** — there is no settled Sanskrit term for the
   "vīsu" (wave/throw) gesture in Carnatic tala. We use **हस्तविसर्जन**
   ("hand-release"), which is descriptive but not a fixed lakshana-grantha
   term. Alternative candidates: **वीचि** (used in Bharatanatyam for
   "wave" hasta), **परावर्तन** ("turning back").

2. **Several asampoorna names** (Geyahejjajji, Bhogachayanata, Sailadesakshi,
   Desisimharavam, Dhautapanchamam) — these names rarely appear in modern
   Devanagari text outside of academic editions of SSP. Spellings here
   follow the Roman names in `asampoornaScales.js` and apply standard
   Sanskrit transliteration; they have **not** been cross-checked against
   the original printed Devanagari of SSP, which the project does not yet
   have access to.

3. **#71 Kusumakaram** duplicates #62 in the Subbarama Dikshitar list —
   this is preserved in both `DIKSHITAR_NAMES` and `DIKSHITAR_DEVANAGARI`.
   The duplication is a documented oddity in SSP, not a transcription
   error.

4. **Jathi vs. Gati** — Carnatic theory uses both terms; some texts treat
   "Nadai" as the Tamil name for Sanskrit "Gati", while jathi refers
   only to laghu-counts. The translations in `JATHI_DEVANAGARI` and
   `NADAI_DEVANAGARI` are intentionally identical because the five-name
   list itself is identical in both contexts.

5. **Chakra "Disi"** — the Sanskrit word for "directions" is दिक् (`dik`)
   or दिशा (`diśā`). The form **दिशि** (used in Hindi Wikipedia) is the
   locative-singular / vocative form treated as a proper noun; we keep
   it because it is the form printed in chakra-mnemonic tables.

6. **Place names** for Lalgudi, Kovur, Ettayapuram — these are Tamil
   towns with no canonical Sanskrit form. The Devanagari spellings are
   transliterations of the modern Tamil pronunciation as used in Hindi
   Wikipedia.

When in doubt, the file falls back gracefully via the `toDevanagari()`
helper, which returns the original English label if no mapping exists.
