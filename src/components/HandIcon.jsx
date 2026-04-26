// Tiny SVG hand with 6 states: clap, wave, finger-1..4
// Stylized — palm with optional finger highlight or wave indicator.

export default function HandIcon({ action, active, size = 36 }) {
  const stroke = active ? '#9B1C1C' : '#7a5a2a'
  const fill = active ? '#D4A24C' : '#FBF5E9'
  const ring = active ? 'drop-shadow(0 0 6px rgba(212,162,76,0.7))' : 'none'

  // Finger positions, indexed 1=pinky, 2=ring, 3=middle, 4=index
  const fingers = [
    { x: 8,  y: 14 }, // 1 pinky
    { x: 14, y: 10 }, // 2 ring
    { x: 20, y: 8  }, // 3 middle
    { x: 26, y: 10 }, // 4 index
  ]

  let highlightFinger = null
  if (action?.startsWith('finger-')) {
    highlightFinger = parseInt(action.split('-')[1])
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ filter: ring }}
    >
      {/* Palm */}
      <path
        d="M6 22 Q6 16 12 14 L28 14 Q34 16 34 22 L34 32 Q34 36 30 36 L10 36 Q6 36 6 32 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Thumb */}
      <path
        d="M30 22 Q36 22 36 26 Q36 30 32 30 L30 30"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Fingers */}
      {fingers.map((f, i) => {
        const fingerNum = i + 1
        const isHighlighted = highlightFinger === fingerNum
        return (
          <rect
            key={fingerNum}
            x={f.x}
            y={f.y}
            width="4"
            height="10"
            rx="2"
            fill={isHighlighted ? '#E07A1F' : fill}
            stroke={stroke}
            strokeWidth="1.2"
          />
        )
      })}
      {/* Wave indicator (curved arrows) */}
      {action === 'wave' && (
        <>
          <path
            d="M14 6 Q20 2 26 6"
            fill="none"
            stroke={active ? '#9B1C1C' : '#7a5a2a'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M26 6 L23 4 M26 6 L25 9" fill="none" stroke={active ? '#9B1C1C' : '#7a5a2a'} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Clap indicator (sparkle) */}
      {action === 'clap' && active && (
        <g>
          <circle cx="20" cy="6" r="1.5" fill="#E07A1F" />
          <circle cx="14" cy="4" r="1" fill="#D4A24C" />
          <circle cx="26" cy="4" r="1" fill="#D4A24C" />
        </g>
      )}
    </svg>
  )
}
