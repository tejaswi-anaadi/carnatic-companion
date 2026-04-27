import { useState } from 'react'
import { CHAKRA_GROUPS, RAGAS } from '../lib/melakartha.js'

// 12 chakra colors, warm-to-cool wrapping the temple palette.
// Chakras 1-6 = M1 (warm: gold → red), Chakras 7-12 = M2 (cool: purple → green-gold).
const CHAKRA_COLORS = [
  '#E5C16C', // 1  Indu    — light gold
  '#E69948', // 2  Netra   — amber
  '#D77241', // 3  Agni    — terracotta
  '#C84A2F', // 4  Veda    — deep red-orange
  '#9B1C1C', // 5  Bana    — crimson
  '#6E1E3D', // 6  Rutu    — wine (M1 ends)
  '#4A2960', // 7  Rishi   — deep purple (M2 starts)
  '#2D4373', // 8  Vasu    — indigo
  '#1F6B7A', // 9  Brahma  — teal
  '#3D8A56', // 10 Disi    — forest green
  '#7AA52F', // 11 Rudra   — olive green
  '#B89A3D', // 12 Aditya  — olive-gold
]

// Geometry (unitless; viewBox scales)
const R_CENTER = 38
const R_CHAKRA_OUT = 92
const R_RAGA_OUT = 142
const RAGA_DEG = 360 / 72   // 5°
const CHAKRA_DEG = 360 / 12 // 30°

// Wheel angle (0 = top, clockwise positive) → SVG cartesian point.
function pointAt(r, theta) {
  const rad = ((theta - 90) * Math.PI) / 180
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) }
}

// Donut-slice path between two angles and two radii.
function donutPath(t1, t2, r1, r2) {
  const p1i = pointAt(r1, t1)
  const p1o = pointAt(r2, t1)
  const p2o = pointAt(r2, t2)
  const p2i = pointAt(r1, t2)
  const large = t2 - t1 > 180 ? 1 : 0
  const f = (n) => n.toFixed(3)
  return [
    `M ${f(p1i.x)} ${f(p1i.y)}`,
    `L ${f(p1o.x)} ${f(p1o.y)}`,
    `A ${r2} ${r2} 0 ${large} 1 ${f(p2o.x)} ${f(p2o.y)}`,
    `L ${f(p2i.x)} ${f(p2i.y)}`,
    `A ${r1} ${r1} 0 ${large} 0 ${f(p1i.x)} ${f(p1i.y)}`,
    'Z',
  ].join(' ')
}

// Half-disc for the M1 / M2 split in the center.
function halfDiscPath(side) {
  const r = R_CENTER
  if (side === 'right') return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} L 0 ${-r} Z`
  return `M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} L 0 ${-r} Z`
}

export default function MelakartaWheel({ onSelectChakra, onSelectRaga }) {
  const [hoverChakra, setHoverChakra] = useState(null)
  const [hoverRaga, setHoverRaga] = useState(null)

  const hoveredRagaObj = hoverRaga ? RAGAS[hoverRaga - 1] : null
  const hoveredChakraObj = hoverChakra != null ? CHAKRA_GROUPS[hoverChakra] : null

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      <div className="overflow-visible">
        <svg
          viewBox="-260 -260 520 520"
          className="w-full h-auto wheel-enter"
          style={{ overflow: 'visible' }}
        >
          {/* Decorative outer dotted ring */}
          <circle cx="0" cy="0" r={R_RAGA_OUT + 2} fill="none" stroke="#D4A24C" strokeWidth="0.6" strokeDasharray="1.5 2" opacity="0.5" />

          {/* Chakra slices (inner ring) */}
          {CHAKRA_GROUPS.map((c, i) => {
            const t1 = i * CHAKRA_DEG
            const t2 = (i + 1) * CHAKRA_DEG
            const mid = (t1 + t2) / 2
            const isHover = hoverChakra === i
            // Tangential label inside the chakra ring.
            const isFlip = mid > 90 && mid < 270
            const labelR = (R_CENTER + R_CHAKRA_OUT) / 2

            return (
              <g
                key={`ch-${i}`}
                onMouseEnter={() => setHoverChakra(i)}
                onMouseLeave={() => setHoverChakra(null)}
                onClick={() => onSelectChakra(i)}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={donutPath(t1, t2, R_CENTER, R_CHAKRA_OUT)}
                  fill={CHAKRA_COLORS[i]}
                  stroke="#FBF5E9"
                  strokeWidth="1.2"
                  className="wheel-chakra"
                  style={{
                    transformOrigin: '0 0',
                    transform: isHover ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 220ms cubic-bezier(0.2,0.7,0.2,1), filter 200ms',
                    filter: isHover ? 'brightness(1.15) drop-shadow(0 0 6px rgba(212,162,76,0.55))' : 'none',
                  }}
                />
                <g
                  pointerEvents="none"
                  transform={`rotate(${isFlip ? mid + 180 : mid})`}
                >
                  <text
                    x="0"
                    y={isFlip ? labelR + 1 : -labelR - 1}
                    fill="#FBF5E9"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      letterSpacing: '0.03em',
                      paintOrder: 'stroke',
                      stroke: 'rgba(0,0,0,0.18)',
                      strokeWidth: 0.4,
                    }}
                  >
                    {c.name}
                  </text>
                  <text
                    x="0"
                    y={isFlip ? labelR + 9 : -labelR + 9}
                    fill="rgba(251,245,233,0.75)"
                    fontSize="4.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {i + 1}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Raga slices (outer ring) */}
          {RAGAS.map((r) => {
            const i = r.number - 1
            const t1 = i * RAGA_DEG
            const t2 = (i + 1) * RAGA_DEG
            const mid = (t1 + t2) / 2
            const isHover = hoverRaga === r.number
            const color = CHAKRA_COLORS[r.chakraIdx]
            const isBottom = mid > 90 && mid < 270
            const numR = (R_CHAKRA_OUT + R_RAGA_OUT) / 2

            return (
              <g
                key={`ra-${r.number}`}
                onMouseEnter={() => setHoverRaga(r.number)}
                onMouseLeave={() => setHoverRaga(null)}
                onClick={() => onSelectRaga(r.number)}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={donutPath(t1, t2, R_CHAKRA_OUT, R_RAGA_OUT)}
                  fill={color}
                  fillOpacity={isHover ? 1 : 0.78}
                  stroke="#FBF5E9"
                  strokeWidth="0.5"
                  className="wheel-raga"
                  style={{
                    transformOrigin: '0 0',
                    transform: isHover ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 200ms cubic-bezier(0.2,0.7,0.2,1), fill-opacity 150ms, filter 150ms',
                    filter: isHover ? 'brightness(1.2) drop-shadow(0 0 5px rgba(224,122,31,0.65))' : 'none',
                  }}
                />
                {/* Raga number inside the slice */}
                <g
                  pointerEvents="none"
                  transform={`rotate(${isBottom ? mid + 180 : mid})`}
                >
                  <text
                    x="0"
                    y={isBottom ? numR : -numR}
                    fill="#FBF5E9"
                    fontSize="6.5"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    {r.number}
                  </text>
                </g>
                {/* Raga name extending outward, radial */}
                <g
                  pointerEvents="none"
                  transform={
                    isBottom
                      ? `rotate(${mid + 90}) translate(${-(R_RAGA_OUT + 5)} 0)`
                      : `rotate(${mid - 90}) translate(${R_RAGA_OUT + 5} 0)`
                  }
                >
                  <text
                    x="0"
                    y="0"
                    fill={isHover ? '#9B1C1C' : '#1C1410'}
                    fontSize={isHover ? 7 : 5.8}
                    fontWeight={isHover ? 700 : 500}
                    textAnchor={isBottom ? 'end' : 'start'}
                    dominantBaseline="middle"
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      transition: 'fill 150ms, font-size 150ms, font-weight 150ms',
                    }}
                  >
                    {r.name}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Center M1 / M2 split (drawn last so it sits on top) */}
          <g pointerEvents="none">
            <path d={halfDiscPath('right')} fill="#FBF5E9" stroke="#9B1C1C" strokeWidth="1.2" />
            <path d={halfDiscPath('left')} fill="#9B1C1C" stroke="#9B1C1C" strokeWidth="1.2" />
            {/* Vertical divider */}
            <line x1="0" y1={-R_CENTER} x2="0" y2={R_CENTER} stroke="#D4A24C" strokeWidth="0.8" />

            {/* Right half: M1 / Suddha (ragas 1–36) */}
            <text
              x="18" y="-3"
              fill="#9B1C1C" fontSize="9" fontWeight="800"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              M₁
            </text>
            <text
              x="18" y="6"
              fill="#9B1C1C" fontSize="4" fontWeight="600"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}
            >
              SUDDHA
            </text>
            <text
              x="18" y="11"
              fill="#9B1C1C" fontSize="3.5" opacity="0.7"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              1–36
            </text>

            {/* Left half: M2 / Prati (ragas 37–72) */}
            <text
              x="-18" y="-3"
              fill="#FBF5E9" fontSize="9" fontWeight="800"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              M₂
            </text>
            <text
              x="-18" y="6"
              fill="#FBF5E9" fontSize="4" fontWeight="600"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}
            >
              PRATI
            </text>
            <text
              x="-18" y="11"
              fill="#FBF5E9" fontSize="3.5" opacity="0.75"
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              37–72
            </text>
          </g>
        </svg>
      </div>

      {/* Status / hint area */}
      <div className="text-center mt-3 min-h-[3.25rem] flex items-center justify-center">
        {hoveredRagaObj ? (
          <div className="px-4 py-2 rounded-lg bg-cream-dark border-2 border-gold inline-flex items-baseline gap-3">
            <span className="text-saffron font-mono text-sm font-bold">#{hoveredRagaObj.number}</span>
            <span className="font-display text-2xl text-crimson font-bold">{hoveredRagaObj.name}</span>
            <span className="text-ink/60 text-xs">
              {hoveredRagaObj.chakra.name} · {hoveredRagaObj.madhyamam === 'M1' ? 'Suddha' : 'Prati'}
            </span>
          </div>
        ) : hoveredChakraObj ? (
          <div className="px-4 py-2 rounded-lg bg-cream-dark border-2 border-gold inline-flex items-baseline gap-3">
            <span className="text-saffron font-mono text-sm font-bold">Chakra {hoveredChakraObj.idx + 1}</span>
            <span className="font-display text-2xl text-crimson font-bold">{hoveredChakraObj.name}</span>
            <span className="text-ink/60 text-xs italic">{hoveredChakraObj.meaning}</span>
          </div>
        ) : (
          <p className="text-ink/55 text-sm italic">
            Hover any slice; click a <span className="text-crimson font-semibold">chakra</span> to expand its 6 ragas, or click a <span className="text-crimson font-semibold">raga</span> in the outer ring to open it directly.
          </p>
        )}
      </div>
    </div>
  )
}
