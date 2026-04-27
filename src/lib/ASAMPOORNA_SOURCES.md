# Asampoorna Mela Scales — Sources & Uncertainties

This document accompanies `asampoornaScales.js`. It records where each piece of
data came from and which entries are uncertain.

## Primary sources consulted

1. **Wikipedia, "Asampurna Melakarta"** — https://en.wikipedia.org/wiki/Asampurna_Melakarta
   The full 72-entry table here was the backbone of the dataset. It is presented
   as the canonical Subbarama Dikshitar / Venkatamakhin listing.
2. **Wikipedia per-raga articles** — used to spot-check individual ragas
   (Rupavati, Sankarabharanam, Latangi/Geetapriya, Sucharitra/Santanamanjari,
   Jhankaradhwani/Jhankarabhramari, Bhinna Shadja, Sri/Shree).
3. **karnatik.com** — `/melaragas.shtml` returned 404 at fetch time; reachable
   per-raga pages were used as secondary corroboration.
4. **shadjam.wordpress.com** (Sangeetha Bharati / SSP-derived posts) — used for
   Rupavati, Kokilapriya, Dhenuka.
5. **guruguha.org** and **music-raagaa.blogspot.com** — used for Rupavati and
   Dikshitar SSP exemplar references.

The 1904 *Sangita Sampradaya Pradarshini* itself was not consulted directly
(no online plain-text edition with full svara tables was available to fetch).
The Wikipedia Asampurna Melakarta page is the standard online digest of SSP.

## Summary statistics

Out of 72 ragas:
- **16 are identical to their sampoorna parent** (`sameAsParent: true`):
  9 (Dhunibhinnashadjam — see uncertainty note below), 15, 16, 29, 38, 45,
  50, 52, 56, 57, 58, 59, 62, 63, 64, 65.
- **56 differ from their sampoorna parent** (audava, shadava, vakra, or with
  characteristic non-melakarta phrases): all the rest.

(If raga 9 is reclassified as audava — see uncertainty below — the split becomes
15 / 57.)

## Notable name reconciliations vs. `melakartha.js`

`melakartha.js` was generated from a different list and disagrees with
Subbarama Dikshitar / Wikipedia on a few names. Where they differ, the
asampoorna scales file uses Wikipedia's name in the `name` field:

| # | melakartha.js | asampoornaScales.js (this file) |
|---|---------------|---------------------------------|
| 19 | Dhwijavanti | Jhankarabhramari |
| 35 | Sailadesakshi | Sailadesakshi (same) |
| 50 | Narmada | Narmada (Wikipedia table prints "Namadeshi"; same scale) |
| 62 | Kusumakaram | Kusumakaram (Wikipedia table prints "Ratipriya"; same scale) |
| 65 | Kalyani | Kalyani (SSP variant: Shantakalyani / Matikalyani) |
| 70 | Nadatarangini | Nadatarangini (Wikipedia table prints "Nasamani") |
| 71 | Kusumakaram | Kusumakaram (Wikipedia retains it as Kusumakaram in some lists; both 62 and 71 use this name in the codebase, which mirrors a known ambiguity in SSP-derived sources) |

These naming variants are all attested. Subbarama Dikshitar himself used
slightly different forms in his 72 Raganga Ragamalika ("Vayuvasantabhairavi"
for #14, "Tapovegavahini" for #16, "Matikalyani" for #65); we have noted these
in the per-raga `note` strings.

## Most ambiguous / uncertain entries

These are the ragas where I am least confident in the exact svara sequence:

1. **#9 Dhunibhinnashadjam** — The popular janya raga "Bhinnashadjam" used
   by Tyagaraja and others is `S G2 M1 D1 N3 S' / S' N3 D1 M1 G2 S` (audava,
   no Ri or Pa). However, this is a *janya* of the 9th mela, not the mela
   itself. SSP sources treat Dhunibhinnashadjam as the mela-form (sampoorna).
   The user's task brief and Wikipedia Asampurna table align with the
   sampoorna form. I went with the sampoorna scale and noted this in the
   per-raga note.
   - Wikipedia raga-page (`Bhinna_Shadja`) and shadjam.wordpress.com say the
     janya form drops Ri and Pa.
   - Wikipedia Asampurna Melakarta table says the mela form is sampoorna.
   - **Resolved**: trust the Asampurna Melakarta table for the mela entry.

2. **#12 Rupavati** — Wikipedia's table renders the arohana as
   "S R₁ M₁ P Ṡ Ṡ" which is clearly a display glitch. The Wikipedia per-raga
   article (Rupavati) gives `S R1 M1 P S'` (audava, drops Ga, Dha, Ni in
   ascent) which matches the avarohana M1-G2 movement. Used the per-raga
   article's value.

3. **#19 Jhankarabhramari** — Strongly vakra (D1-N1-D1-P-D1 in arohana).
   Some sources give a simpler sampoorna form. Wikipedia's table value used
   here. Naming variant: melakartha.js has "Dhwijavanti" — which is actually
   a janya of Harikambhoji, not the asampoorna form of #19. I trusted the
   Wikipedia "Jhankarabhramari" name for the asampoorna form.

4. **#23 Gauriveluvali** — Arohana `S R2 G2 S R2 M1 P D2 S'` includes a return
   to S after G2. Preserved as in source; this kind of vakra is consistent
   with Subbarama Dikshitar's lakshana-gita style.

5. **#26 Tarangini** — Avarohana is unusually long and zigzag
   (`S' D1 P G3 R2 S R2 G3 M1 G3 R2 S`). Preserved as in source. The drop to
   S in the middle of the avarohana is distinctive.

6. **#34 Bhogachayanata** — Avarohana includes a jump back up to S' partway
   down (`S' N2 D2 N2 P S' N2 P M1 R3 S`). Preserved.

7. **#35 Sailadesakshi** — Avarohana shows `S' N3 D2 S N3 P M1 R3 S`. The "S"
   in the middle could be a misprint for "S'" or "P" in the Wikipedia table.
   Preserved as-is, with a note flagging the uncertainty.

8. **#67 Santanamanjari** — Wikipedia's per-raga article on Sucharitra
   (the parent) describes Santanamanjari as similar/derived. The Wikipedia
   Asampurna table gives `S R3 G3 M2 P D1 S' / S' N1 D1 P M2 R3 S`
   (shadava-shadava). I trusted the table.

9. **#71 Kusumakaram (parent: Kosalam)** — Avarohana has vakra M2-R3-G3-S
   (Ri before Ga in descent). The name duplicates raga 62 in `melakartha.js`
   too — a known oddity in some SSP-derived lists.

10. **#72 Rasamanjari** — Heavy vakra; the arohana has a drop to S after G3
    (`S R3 G3 S P M2 P N3 D3 N3 S'`). Preserved exactly.

## Sources where Wikipedia and another source disagreed

- **#9 Bhinnashadjam vs. Dhunibhinnashadjam**: shadjam.wordpress.com and the
  Wikipedia "Bhinna_Shadja" page describe an audava janya. The Wikipedia
  Asampurna Melakarta table describes the *mela* as sampoorna. **Resolved**:
  the file's entry for #9 is the mela form (sampoorna); the audava version is
  a separate janya raga, not the mela itself.

- **#19 name**: Wikipedia uses "Jhankarabhramari" in the Asampurna table;
  `melakartha.js` (already in this codebase) uses "Dhwijavanti". The latter
  is incorrect — Dwijavanti is a janya of #28 Harikambhoji. **Resolved**:
  used Wikipedia's name in the new file.

- **#63 Geetapriya** as sampoorna vs. having phrase peculiarities: the
  Wikipedia per-raga article on Latangi confirms it is sampoorna-sampoorna
  (Geetapriya = same scale in SSP). **Resolved**: marked sampoorna identical
  to parent.

## Limitations

- I did not consult the original SSP (Subbarama Dikshitar 1904) text;
  per-raga lakshana-gitas in SSP could disambiguate a few entries (notably
  #7 Senagrani, #20 Nariritigaula, #34 Bhogachayanata, #72 Rasamanjari)
  more precisely.
- Scholars such as Hema Ramanathan and R. Ramachandran have published
  detailed lakshana descriptions that often note multiple variants per raga;
  I have given a single canonical form per raga, biased toward the
  Wikipedia/Karnatik consensus.
- For ragas with `sameAsParent: true` I did not transcribe individual
  Dikshitar kriti-derived phrases — only the structural scale.
