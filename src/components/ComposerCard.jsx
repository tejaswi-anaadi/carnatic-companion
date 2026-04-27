import { Calendar, MapPin, Heart, Quote } from 'lucide-react'
import PilgrimageMap from './PilgrimageMap.jsx'

export default function ComposerCard({ composer }) {
  const accent = composer.accentColor

  return (
    <article className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
      <header className="flex flex-wrap items-baseline gap-3 mb-4">
        <h3 className="font-display text-3xl md:text-4xl text-crimson font-bold">{composer.name}</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-saffron">{composer.fullName}</span>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-5 text-sm">
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <Calendar className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">Lifespan</div>
            <div className="font-semibold">{composer.dates}</div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <MapPin className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">Birthplace</div>
            <div className="font-semibold">{composer.birthplace}</div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <Heart className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">Ishta Devata</div>
            <div className="font-semibold">{composer.deity}</div>
          </div>
        </div>
      </div>

      <p className="text-ink/85 leading-relaxed text-[15px] mb-4">{composer.bio}</p>

      <div className="rounded-lg bg-crimson/5 border-l-4 border-crimson p-3 mb-5 flex gap-2">
        <Quote className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
        <p className="text-sm italic text-ink/85">{composer.anecdote}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-[0.2em] text-saffron font-semibold">Pilgrimage Trail</h4>
        <PilgrimageMap stops={composer.pilgrimage} accent={accent} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {composer.pilgrimage.map((p, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-cream-dark border border-gold/40 text-ink/80">
              <span className="text-crimson font-semibold">{p.town}</span> · {p.temple}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
