# Carnatic Companion

An interactive single-page web app for exploring Carnatic music theory.

## Modules

- **Ragas** — All 72 Melakartha ragas, generated algorithmically from the Chakra system. Toggle between Govinda/Thyagaraja and Muthuswami Dikshitar (Asampoorna) naming. Hear arohanam/avarohanam played through the Web Audio API with real-time piano-key highlighting.
- **Talas** — All 35 Suladi Sapta Talas (7 families × 5 jathis), with selectable Nadai (3, 4, 5, 7, 9 sub-clicks per beat). Animated visualizer showing claps, waves, and finger counts in sync with a metronome.
- **History** — The Carnatic Trinity (Tyagaraja, Muthuswami Dikshitar, Syama Sastri): biographies, anecdotes, and stylized pilgrimage maps.
- **Tools** — Katapayadi decoder: type a raga name (e.g. `Mechakalyani`) or number (1–72) and see the parse step-by-step plus a cheat sheet.

## Tech

- **React 18** (functional components, hooks)
- **Tailwind CSS v3** — temple palette (crimson, gold, saffron, cream)
- **Web Audio API** — native synth + metronome, no audio assets
- **lucide-react** — all iconography
- **Vite** — build/dev tooling

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

## Project layout

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/      # Layout, Piano, ChakraGrid, RagaDetail, TalaVisualizer, etc.
├── views/           # RagasView, TalasView, HistoryView, ToolsView
├── hooks/
│   ├── useAudioEngine.js
│   └── useMetronome.js
└── lib/
    ├── swaras.js
    ├── melakartha.js
    ├── talas.js
    ├── katapayadi.js
    └── trinityData.js
```

All data is generated or hardcoded in-app — no external APIs, no image assets.
