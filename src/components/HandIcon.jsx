// Stylized 5-finger hand icon. States: clap, wave, finger-1..5
// finger-1 = pinky, finger-2 = ring, finger-3 = middle, finger-4 = index, finger-5 = thumb
// All 5 fingers are used in Carnatic counting; thumb is reached in Misra (7) and Sankirna (9) jathis.
//
// Laghu / Clap / Finger counting: Hand faces DOWN on the thigh —
//   the viewer sees the BACK of the hand. Fingers are highlighted on the back.
//
// Drutam wave (veechu): Hand flips UPWARD — palm faces viewer.
//   We show the palm side with a turning arrow to indicate the flip.

export default function HandIcon({ action, active, size = 64 }) {
  // Color scheme
  const palmFill   = active ? '#F4D49A' : '#F0E0BE'
  const palmStroke = active ? '#7a3a18' : '#8a6a3a'
  const fingerStroke = active ? '#7a3a18' : '#8a6a3a'
  const highlightFill   = '#E07A1F'
  const highlightStroke = '#9B1C1C'

  // Back-of-hand colors
  const backFill   = active ? '#EAC988' : '#E6D5AF'
  const backStroke = active ? '#7a3a18' : '#8a6a3a'
  const knuckleColor = active ? '#C49456' : '#C4A468'

  // Determine highlighted finger (1=pinky, 2=ring, 3=middle, 4=index, 5=thumb)
  let hi = null
  if (action?.startsWith('finger-')) hi = parseInt(action.split('-')[1])
  const isThumbHi = hi === 5

  // Finger geometry
  const fingers = [
    { id: 1, x: 14, w: 11, h: 32, label: 'pinky'  },
    { id: 2, x: 28, w: 12, h: 40, label: 'ring'   },
    { id: 3, x: 43, w: 12, h: 46, label: 'middle' },
    { id: 4, x: 58, w: 12, h: 38, label: 'index'  },
  ]
  const palmTop = 58

  const isClap = action === 'clap'
  const isWave = action === 'wave'

  const glowId = `glow-${Math.random().toString(36).slice(2, 8)}`

  // ---- WAVE (veechu): Hand flipped UP — show PALM SIDE ----
  if (isWave) {
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
        </defs>

        {/* Turning arrow above the hand */}
        <g filter={active ? `url(#${glowId})` : undefined}>
          <path
            d="M 22 8 Q 50 -6 78 8"
            fill="none"
            stroke={active ? '#9B1C1C' : '#8a6a3a'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 78 8 L 72 3 M 78 8 L 74 14"
            fill="none"
            stroke={active ? '#9B1C1C' : '#8a6a3a'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Fingers — palm side (no highlighting needed for wave) */}
        {fingers.map((f) => {
          const fy = palmTop - f.h
          return (
            <g key={f.id}>
              <rect
                x={f.x}
                y={fy}
                width={f.w}
                height={f.h + 4}
                rx={f.w / 2}
                fill={`url(#${glowId}-finger)`}
                stroke={fingerStroke}
                strokeWidth={1.6}
              />
              {/* Knuckle line */}
              <line
                x1={f.x + 1.5}
                y1={fy + f.h * 0.45}
                x2={f.x + f.w - 1.5}
                y2={fy + f.h * 0.45}
                stroke={fingerStroke}
                strokeOpacity="0.4"
                strokeWidth="1"
              />
              {/* Tip nail */}
              <ellipse
                cx={f.x + f.w / 2}
                cy={fy + 4}
                rx={f.w / 2 - 2}
                ry={2}
                fill="#FFEACA"
                opacity="0.7"
              />
            </g>
          )
        })}

        {/* Thumb — palm side, enlarged */}
        <g>
          <path
            d="M 78 56 Q 100 48 102 66 Q 102 84 86 82 L 80 76 Z"
            fill={palmFill}
            stroke={palmStroke}
            strokeWidth="1.6"
          />
          <line x1={84} y1={66} x2={96} y2={64} stroke={palmStroke} strokeOpacity="0.35" strokeWidth="1" />
          <ellipse cx={94} cy={54} rx={4} ry={2.5} fill="#FFEACA" opacity="0.7" />
        </g>

        {/* Palm */}
        <path
          d="M 10 60 Q 10 95 22 102 L 70 102 Q 84 100 84 86 L 84 60 Q 80 56 70 56 L 24 56 Q 12 56 10 60 Z"
          fill={palmFill}
          stroke={palmStroke}
          strokeWidth="2"
        />

        {/* Palm crease lines */}
        <path d="M 22 78 Q 40 84 64 78" fill="none" stroke={palmStroke} strokeOpacity="0.25" strokeWidth="1" />
        <path d="M 26 92 Q 44 96 62 92" fill="none" stroke={palmStroke} strokeOpacity="0.2" strokeWidth="1" />
      </svg>
    )
  }

  // ---- CLAP & FINGER modes: Hand faces DOWN — show BACK OF HAND ----
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
        <linearGradient id={`${glowId}-back-finger`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8D5A0" />
          <stop offset="100%" stopColor="#D4BE88" />
        </linearGradient>
        <linearGradient id={`${glowId}-back-palm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={backFill} />
          <stop offset="100%" stopColor="#D4BE88" />
        </linearGradient>
        <linearGradient id={`${glowId}-hi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A249" />
          <stop offset="100%" stopColor="#E07A1F" />
        </linearGradient>
      </defs>

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

      {/* Back-of-hand fingers (mirrored: index on left, pinky on right when palm-down) */}
      {fingers.map((f) => {
        const isHi = hi === f.id
        const mirroredX = 84 - f.x - f.w
        const fy = palmTop - f.h
        return (
          <g
            key={f.id}
            filter={isHi ? `url(#${glowId})` : undefined}
          >
            <rect
              x={mirroredX}
              y={fy}
              width={f.w}
              height={f.h + 4}
              rx={f.w / 2}
              fill={isHi ? `url(#${glowId}-hi)` : `url(#${glowId}-back-finger)`}
              stroke={isHi ? highlightStroke : backStroke}
              strokeWidth={isHi ? 2.5 : 1.6}
            />
            {/* Knuckle ridges — two lines (back of hand) */}
            <line
              x1={mirroredX + 2}
              y1={fy + f.h * 0.35}
              x2={mirroredX + f.w - 2}
              y2={fy + f.h * 0.35}
              stroke={isHi ? highlightStroke : knuckleColor}
              strokeOpacity={isHi ? 0.5 : 0.6}
              strokeWidth="1.2"
            />
            <line
              x1={mirroredX + 2}
              y1={fy + f.h * 0.5}
              x2={mirroredX + f.w - 2}
              y2={fy + f.h * 0.5}
              stroke={isHi ? highlightStroke : knuckleColor}
              strokeOpacity={isHi ? 0.4 : 0.4}
              strokeWidth="1"
            />
            {/* Nail on back (more visible from back) */}
            <rect
              x={mirroredX + 2}
              y={fy + 1}
              width={f.w - 4}
              height={5}
              rx={2}
              fill={isHi ? '#FFD4A0' : '#FFEACA'}
              stroke={isHi ? highlightStroke : knuckleColor}
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
          </g>
        )
      })}

      {/* Thumb — mirrored to left side (back of hand), highlightable as finger-5 */}
      <g filter={isThumbHi ? `url(#${glowId})` : undefined}>
        <path
          d="M 16 56 Q -4 50 -6 66 Q -6 82 8 82 L 14 78 Z"
          fill={isThumbHi ? highlightFill : backFill}
          stroke={isThumbHi ? highlightStroke : backStroke}
          strokeWidth={isThumbHi ? 2.5 : 1.6}
        />
        {/* Thumb knuckle line */}
        <line
          x1={0}
          y1={66}
          x2={10}
          y2={64}
          stroke={isThumbHi ? highlightStroke : knuckleColor}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        {/* Thumb nail (back view) */}
        <rect
          x={0}
          y={54}
          width={8}
          height={5}
          rx={2}
          fill={isThumbHi ? '#FFD4A0' : '#FFEACA'}
          stroke={isThumbHi ? highlightStroke : knuckleColor}
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />
      </g>

      {/* Back of palm */}
      <path
        d="M 10 60 Q 10 95 22 102 L 70 102 Q 84 100 84 86 L 84 60 Q 80 56 70 56 L 24 56 Q 12 56 10 60 Z"
        fill={`url(#${glowId}-back-palm)`}
        stroke={backStroke}
        strokeWidth="2"
      />

      {/* Knuckle bumps across top of palm */}
      {fingers.map((f) => {
        const mirroredX = 84 - f.x - f.w
        return (
          <ellipse
            key={`knuckle-${f.id}`}
            cx={mirroredX + f.w / 2}
            cy={60}
            rx={f.w / 2 + 1}
            ry={3}
            fill={knuckleColor}
            opacity="0.3"
          />
        )
      })}

      {/* Tendon lines on back of hand */}
      {fingers.map((f) => {
        const mirroredX = 84 - f.x - f.w
        const cx = mirroredX + f.w / 2
        return (
          <line
            key={`tendon-${f.id}`}
            x1={cx}
            y1={62}
            x2={cx}
            y2={85}
            stroke={knuckleColor}
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        )
      })}

      {/* Wrist line */}
      <path d="M 26 92 Q 44 96 62 92" fill="none" stroke={backStroke} strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  )
}
