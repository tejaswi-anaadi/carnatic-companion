import { Landmark, MapPin } from 'lucide-react'

// Stylized non-geographic constellation of temple stops connected by dotted lines.
export default function PilgrimageMap({ stops, accent = 'crimson' }) {
  // Scatter stops in a constellation pattern (deterministic positions).
  const positions = stops.map((_, i) => {
    const cols = 4
    const row = Math.floor(i / cols)
    const col = i % cols
    const xJitter = ((i * 137) % 30) - 15
    const yJitter = ((i * 73) % 24) - 12
    return {
      left: `${10 + col * 24 + xJitter * 0.3}%`,
      top:  `${15 + row * 35 + yJitter * 0.5}%`,
    }
  })

  const accentColor = { crimson: '#9B1C1C', gold: '#A67D32', saffron: '#E07A1F' }[accent] || '#9B1C1C'

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-xl bg-gradient-to-br from-cream-dark to-cream border-2 border-gold/40 overflow-hidden">
      {/* Decorative compass star */}
      <div className="absolute top-3 right-3 text-gold/40 text-xs font-display italic">South India · stylized</div>

      {/* Connecting dotted lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {positions.slice(1).map((p, i) => {
          const a = positions[i]
          const b = p
          const ax = parseFloat(a.left), ay = parseFloat(a.top)
          const bx = parseFloat(b.left), by = parseFloat(b.top)
          return (
            <line
              key={i}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke={accentColor}
              strokeWidth="0.3"
              strokeDasharray="1 1"
              opacity="0.5"
            />
          )
        })}
      </svg>

      {/* Pins */}
      {stops.map((stop, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 group"
          style={positions[i]}
        >
          <div className="flex flex-col items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-temple border-2"
              style={{ background: accentColor, borderColor: '#D4A24C' }}
            >
              <Landmark className="w-4 h-4 text-cream" />
            </div>
            <div className="mt-1 px-1.5 py-0.5 rounded bg-cream border border-gold/40 text-[10px] font-semibold text-ink whitespace-nowrap shadow-sm">
              <span className="text-crimson">{stop.town}</span>
            </div>
            <div className="hidden group-hover:block absolute top-full mt-1 px-2 py-1 rounded bg-ink text-cream text-[10px] whitespace-nowrap z-10">
              {stop.temple}
            </div>
          </div>
        </div>
      ))}

      {/* Stop count badge */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-crimson text-cream text-[10px] flex items-center gap-1">
        <MapPin className="w-3 h-3" /> {stops.length} stops
      </div>
    </div>
  )
}
