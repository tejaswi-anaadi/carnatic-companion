// Stylized 5-finger hand icon. States: clap, wave, finger-1..4
// finger-1 = pinky, finger-2 = ring, finger-3 = middle, finger-4 = index
// Thumb is always present as anchor; never highlighted in carnatic counting.

export default function HandIcon({ action, active, size = 64 }) {
  // Color scheme
  const palmFill   = active ? '#F4D49A' : '#F0E0BE'   // warm flesh-ish
  const palmStroke = active ? '#7a3a18' : '#8a6a3a'
  const fingerFill = active ? '#F8DEAA' : '#F4D49A'
  const fingerStroke = active ? '#7a3a18' : '#8a6a3a'
  const highlightFill   = '#E07A1F'   // saffron for the active finger
  const highlightStroke = '#9B1C1C'

  // Determine highlighted finger (1=pinky..4=index)
  let hi = null
  if (action?.startsWith('finger-')) hi = parseInt(action.split('-')[1])

  // Finger geometry — rectangles standing up from palm.
  // Pinky shortest, middle longest, index slightly shorter than middle.
  // X positions across palm width 70 (palm spans x=10..80).
  const fingers = [
    { id: 1, x: 14, w: 11, h: 32, label: 'pinky'  },
    { id: 2, x: 28, w: 12, h: 40, label: 'ring'   },
    { id: 3, x: 43, w: 12, h: 46, label: 'middle' },
    { id: 4, x: 58, w: 12, h: 38, label: 'index'  },
  ]
  // Each finger's BOTTOM is at y=58 (top of palm); top = 58 - h
  const palmTop = 58

  const isClap = action === 'clap'
  const isWave = action === 'wave'

  // Glow filter when active
  const glowId = `glow-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${glowId}-finger`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAE3B5" />
          <stop offset="100%" stopColor="#F4D49A" />
        </linearGradient>
        <linearGradient id={`${glowId}-hi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A249" />
          <stop offset="100%" stopColor="#E07A1F" />
        </linearGradient>
      </defs>

      {/* Wave arc (above the hand) */}
      {isWave && (
        <g filter={active ? `url(#${glowId})` : undefined}>
          <path
            d="M 18 14 Q 50 -2 82 14"
            fill="none"
            stroke={active ? '#9B1C1C' : '#8a6a3a'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 82 14 L 76 9 M 82 14 L 78 19"
            fill="none"
            stroke={active ? '#9B1C1C' : '#8a6a3a'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Clap sparkles */}
      {isClap && active && (
        <g filter={`url(#${glowId})`}>
          <g transform="translate(50 8)">
            <path d="M 0 -8 L 1.5 -1.5 L 8 0 L 1.5 1.5 L 0 8 L -1.5 1.5 L -8 0 L -1.5 -1.5 Z"
              fill="#E07A1F" />
          </g>
          <circle cx="22" cy="14" r="2.5" fill="#D4A24C" />
          <circle cx="78" cy="14" r="2.5" fill="#D4A24C" />
          <circle cx="14" cy="26" r="1.8" fill="#E07A1F" />
          <circle cx="86" cy="26" r="1.8" fill="#E07A1F" />
        </g>
      )}

      {/* Fingers */}
      {fingers.map((f) => {
        const isHi = hi === f.id
        const fy = palmTop - f.h
        return (
          <g
            key={f.id}
            filter={isHi ? `url(#${glowId})` : undefined}
          >
            <rect
              x={f.x}
              y={fy}
              width={f.w}
              height={f.h + 4}
              rx={f.w / 2}
              fill={isHi ? `url(#${glowId}-hi)` : `url(#${glowId}-finger)`}
              stroke={isHi ? highlightStroke : fingerStroke}
              strokeWidth={isHi ? 2.5 : 1.6}
            />
            {/* Knuckle line */}
            <line
              x1={f.x + 1.5}
              y1={fy + f.h * 0.45}
              x2={f.x + f.w - 1.5}
              y2={fy + f.h * 0.45}
              stroke={isHi ? highlightStroke : fingerStroke}
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            {/* Tip nail */}
            <ellipse
              cx={f.x + f.w / 2}
              cy={fy + 4}
              rx={f.w / 2 - 2}
              ry={2}
              fill={isHi ? '#FFD4A0' : '#FFEACA'}
              opacity="0.7"
            />
          </g>
        )
      })}

      {/* Thumb — angled out from right side of palm */}
      <g>
        <path
          d="M 80 60 Q 96 56 96 70 Q 96 82 84 80 L 80 76 Z"
          fill={palmFill}
          stroke={palmStroke}
          strokeWidth="1.6"
        />
      </g>

      {/* Palm */}
      <path
        d="M 10 60 Q 10 95 22 102 L 70 102 Q 84 100 84 86 L 84 60 Q 80 56 70 56 L 24 56 Q 12 56 10 60 Z"
        fill={palmFill}
        stroke={palmStroke}
        strokeWidth="2"
      />

      {/* Palm crease lines (subtle) */}
      <path
        d="M 22 78 Q 40 84 64 78"
        fill="none"
        stroke={palmStroke}
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M 26 92 Q 44 96 62 92"
        fill="none"
        stroke={palmStroke}
        strokeOpacity="0.2"
        strokeWidth="1"
      />
    </svg>
  )
}
