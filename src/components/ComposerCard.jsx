import { Calendar, MapPin, Heart, Quote } from 'lucide-react'
import PilgrimageMap from './PilgrimageMap.jsx'
import { useT } from '../lib/i18n.jsx'

export default function ComposerCard({ composer }) {
  const accent = composer.accentColor
  const t = useT()
  const isSa = t.lang === 'sa'

  return (
    <article className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
      <header className="flex flex-wrap items-baseline gap-3 mb-4">
        <h3 className={'text-3xl md:text-4xl text-crimson font-bold ' + (isSa ? 'font-devanagari' : 'font-display')}>
          {t.composer(composer.name)}
        </h3>
        <span className={'text-xs uppercase tracking-[0.2em] text-saffron ' + (isSa ? 'font-devanagari' : '')}>
          {isSa ? t.composer(composer.fullName) : composer.fullName}
        </span>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-5 text-sm">
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <Calendar className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">{isSa ? 'जीवन-काल' : 'Lifespan'}</div>
            <div className="font-semibold">{composer.dates}</div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <MapPin className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">{isSa ? 'जन्म-स्थान' : 'Birthplace'}</div>
            <div className={'font-semibold ' + (isSa ? 'font-devanagari' : '')}>
              {isSa
                ? composer.birthplace.split(', ').map(s => t.town(s.trim()) ?? s).join(', ')
                : composer.birthplace}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-cream-dark border border-gold/30">
          <Heart className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/50">{isSa ? 'इष्ट देवता' : 'Ishta Devata'}</div>
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
        <h4 className="text-xs uppercase tracking-[0.2em] text-saffron font-semibold">{isSa ? 'तीर्थ-यात्रा' : 'Pilgrimage Trail'}</h4>
        <PilgrimageMap stops={composer.pilgrimage} accent={accent} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {composer.pilgrimage.map((p, i) => (
            <span key={i} className={'text-[11px] px-2 py-0.5 rounded-full bg-cream-dark border border-gold/40 text-ink/80 ' + (isSa ? 'font-devanagari' : '')}>
              <span className="text-crimson font-semibold">{isSa ? t.town(p.town) : p.town}</span> · {isSa ? t.temple(p.temple) : p.temple}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
