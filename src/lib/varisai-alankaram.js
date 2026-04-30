// Alankarams — multi-tala compositions in the saptha tala (7 talas) system,
// plus the two variants of Sankeerna Eka. Source: shivkumar.org / Ravikiran.
//
// Unlike Sarali / Janta / Dhatu (which all sit on Adi tala = 8 aksharas
// per line), Alankarams use one of seven traditional talas with varying
// anga structures. Each pattern carries its own `barPositions` (1-indexed
// akshara positions AFTER which a bar line is drawn) so the rendering
// reflects the laghu / drutham / anudhrutham boundaries of that tala.
//
// Notation:
//   I_n = laghu of n aksharas
//   0   = drutham (2 aksharas)
//   U   = anudhrutham (1 akshara)
// `null` = kaarvai (sustain previous note for one akshara)
//
// At 1st speed each akshara takes one beat. The kaalam selector globally
// changes the akshara rate (1, 2, 4 swaras/beat), matching the carnatic
// definition that "speed = swaras per beat of the tala".

export const ALANKARAM_PATTERNS = [
  {
    id: 1,
    title: 'Druva Talam · Chatushra Jati',
    laya: 'I₄ 0 I₄ I₄  =  4 + 2 + 4 + 4  =  14 aksharas',
    barPositions: [4, 6, 10],
    lines: [
      [0,1,2,3, 2,1, 0,1,2,1, 0,1,2,3],
      [1,2,3,4, 3,2, 1,2,3,2, 1,2,3,4],
      [2,3,4,5, 4,3, 2,3,4,3, 2,3,4,5],
      [3,4,5,6, 5,4, 3,4,5,4, 3,4,5,6],
      [4,5,6,7, 6,5, 4,5,6,5, 4,5,6,7],
      [7,6,5,4, 5,6, 7,6,5,6, 7,6,5,4],
      [6,5,4,3, 4,5, 6,5,4,5, 6,5,4,3],
      [5,4,3,2, 3,4, 5,4,3,4, 5,4,3,2],
      [4,3,2,1, 2,3, 4,3,2,3, 4,3,2,1],
      [3,2,1,0, 1,2, 3,2,1,2, 3,2,1,0],
    ],
  },
  {
    id: 2,
    title: 'Matya Talam · Chatushra Jati',
    laya: 'I₄ 0 I₄  =  4 + 2 + 4  =  10 aksharas',
    barPositions: [4, 6],
    lines: [
      [0,1,2,1, 0,1, 0,1,2,3],
      [1,2,3,2, 1,2, 1,2,3,4],
      [2,3,4,3, 2,3, 2,3,4,5],
      [3,4,5,4, 3,4, 3,4,5,6],
      [4,5,6,5, 4,5, 4,5,6,7],
      [7,6,5,6, 7,6, 7,6,5,4],
      [6,5,4,5, 6,5, 6,5,4,3],
      [5,4,3,4, 5,4, 5,4,3,2],
      [4,3,2,3, 4,3, 4,3,2,1],
      [3,2,1,2, 3,2, 3,2,1,0],
    ],
  },
  {
    id: 3,
    title: 'Rupaka Talam · Chatushra Jati',
    laya: '0 I₄  =  2 + 4  =  6 aksharas',
    barPositions: [2],
    lines: [
      [0,1, 0,1,2,3],
      [1,2, 1,2,3,4],
      [2,3, 2,3,4,5],
      [3,4, 3,4,5,6],
      [4,5, 4,5,6,7],
      [7,6, 7,6,5,4],
      [6,5, 6,5,4,3],
      [5,4, 5,4,3,2],
      [4,3, 4,3,2,1],
      [3,2, 3,2,1,0],
    ],
  },
  {
    id: 4,
    title: 'Jhampa Talam · Mishra Jati',
    laya: 'I₇ U 0  =  7 + 1 + 2  =  10 aksharas',
    barPositions: [7, 8],
    lines: [
      [0,1,2,0,1,0,1, 2, 3,null],
      [1,2,3,1,2,1,2, 3, 4,null],
      [2,3,4,2,3,2,3, 4, 5,null],
      [3,4,5,3,4,3,4, 5, 6,null],
      [4,5,6,4,5,4,5, 6, 7,null],
      [7,6,5,7,6,7,6, 5, 4,null],
      [6,5,4,6,5,6,5, 4, 3,null],
      [5,4,3,5,4,5,4, 3, 2,null],
      [4,3,2,4,3,4,3, 2, 1,null],
      [3,2,1,3,2,3,2, 1, 0,null],
    ],
  },
  {
    id: 5,
    title: 'Triputa Talam · Thrisra Jati',
    laya: 'I₃ 0 0  =  3 + 2 + 2  =  7 aksharas',
    barPositions: [3, 5],
    lines: [
      [0,1,2, 0,1, 2,3],
      [1,2,3, 1,2, 3,4],
      [2,3,4, 2,3, 4,5],
      [3,4,5, 3,4, 5,6],
      [4,5,6, 4,5, 6,7],
      [7,6,5, 7,6, 5,4],
      [6,5,4, 6,5, 4,3],
      [5,4,3, 5,4, 3,2],
      [4,3,2, 4,3, 2,1],
      [3,2,1, 3,2, 1,0],
    ],
  },
  {
    id: 6,
    title: 'Ata Talam · Khanda Jati',
    laya: 'I₅ I₅ 0 0  =  5 + 5 + 2 + 2  =  14 aksharas',
    barPositions: [5, 10, 12],
    lines: [
      [0,1,null,2,null,  0,null,1,2,null,  3,null,  3,null],
      [1,2,null,3,null,  1,null,2,3,null,  4,null,  4,null],
      [2,3,null,4,null,  2,null,3,4,null,  5,null,  5,null],
      [3,4,null,5,null,  3,null,4,5,null,  6,null,  6,null],
      [4,5,null,6,null,  4,null,5,6,null,  7,null,  7,null],
      [7,6,null,5,null,  7,null,6,5,null,  4,null,  4,null],
      [6,5,null,4,null,  6,null,5,4,null,  3,null,  3,null],
      [5,4,null,3,null,  5,null,4,3,null,  2,null,  2,null],
      [4,3,null,2,null,  4,null,3,2,null,  1,null,  1,null],
      [3,2,null,1,null,  3,null,2,1,null,  0,null,  0,null],
    ],
  },
  {
    id: 7,
    title: 'Eka Talam · Chatushra Jati',
    laya: 'I₄  =  4 aksharas',
    barPositions: [],
    lines: [
      [0,1,2,3],
      [1,2,3,4],
      [2,3,4,5],
      [3,4,5,6],
      [4,5,6,7],
      [7,6,5,4],
      [6,5,4,3],
      [5,4,3,2],
      [4,3,2,1],
      [3,2,1,0],
    ],
  },
  // Alankarams 8 & 9 (Sankeerna Eka v1 / v2) — to be added separately later.
]
