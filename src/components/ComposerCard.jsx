import { useState } from 'react'
import { Calendar, MapPin, Heart, Quote, Music, BookOpen, Sparkles, ChevronDown, ChevronUp, Mic2, Tag, GraduationCap, Flame, ScrollText } from 'lucide-react'
import PilgrimageMap from './PilgrimageMap.jsx'

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gold/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-cream-dark hover:bg-gold/10 transition text-left"
      >
        <Icon className="w-4.5 h-4.5 text-crimson shrink-0" />
        <span className="font-display text-base text-crimson font-semibold flex-1">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-ink/40" />
          : <ChevronDown className="w-4 h-4 text-ink/40" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-cream/80 border-t border-gold/20 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  )
}

function AnecdoteCard({ anecdote }) {
  return (
    <div className="rounded-lg bg-crimson/5 border-l-4 border-crimson p-3 flex gap-2">
      <Quote className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
      <div>
        <p className="text-sm italic text-ink/85 leading-relaxed">{anecdote.quote}</p>
        {anecdote.context && (
          <p className="text-[11px] text-saffron font-semibold mt-1.5 uppercase tracking-wider">{anecdote.context}</p>
        )}
      </div>
    </div>
  )
}

export default function ComposerCard({ composer }) {
  return (
    <article className="rounded-2xl bg-cream border-2 border-gold shadow-temple p-5 md:p-6 paper">
      {/* Header */}
      <header className="flex flex-wrap items-baseline gap-3 mb-4">
        <h3 className="font-display text-3xl md:text-4xl text-crimson font-bold">{composer.name}</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-saffron">{composer.fullName}</span>
      </header>

      {/* Quick facts grid */}
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

      {/* Signature details row */}
      <div className="flex flex-wrap gap-2 mb-5">
        {composer.mudra && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-crimson/10 border border-crimson/30 text-crimson font-semibold">
            <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />Mudra: {composer.mudra}
          </span>
        )}
        {composer.language && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron font-semibold">
            <ScrollText className="w-3 h-3 inline mr-1 -mt-0.5" />{composer.language}
          </span>
        )}
        {composer.compositionCount && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-ink/70 font-semibold">
            <Music className="w-3 h-3 inline mr-1 -mt-0.5" />{composer.compositionCount}
          </span>
        )}
      </div>

      {/* Primary anecdote */}
      {composer.anecdotes && composer.anecdotes.length > 0 && (
        <div className="mb-5">
          <AnecdoteCard anecdote={composer.anecdotes[0]} />
        </div>
      )}

      {/* Expandable sections */}
      <div className="space-y-3 mb-5">
        {/* Life History */}
        <Section icon={BookOpen} title="Early Life & Family" defaultOpen={true}>
          <p className="text-ink/85 leading-relaxed text-[14px]">{composer.earlyLife}</p>
        </Section>

        {/* Guru & Training */}
        {composer.guruTraining && (
          <Section icon={GraduationCap} title="Guru & Training">
            <p className="text-ink/85 leading-relaxed text-[14px]">{composer.guruTraining}</p>
          </Section>
        )}

        {/* Sadhana */}
        {composer.sadhana && (
          <Section icon={Flame} title="Sadhana & Spiritual Practice">
            <p className="text-ink/85 leading-relaxed text-[14px]">{composer.sadhana}</p>
          </Section>
        )}

        {/* Musical Style */}
        {composer.musicalStyle && (
          <Section icon={Music} title="Musical Style & Innovations">
            <p className="text-ink/85 leading-relaxed text-[14px]">{composer.musicalStyle}</p>
          </Section>
        )}

        {/* Famous Works */}
        {composer.famousWorks && (
          <Section icon={Mic2} title="Notable Compositions">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gold/30">
                    <th className="text-left py-1.5 px-2 text-[10px] uppercase tracking-wider text-ink/50 font-semibold">Kriti</th>
                    <th className="text-left py-1.5 px-2 text-[10px] uppercase tracking-wider text-ink/50 font-semibold">Raga</th>
                    <th className="text-left py-1.5 px-2 text-[10px] uppercase tracking-wider text-ink/50 font-semibold hidden sm:table-cell">Tala</th>
                    <th className="text-left py-1.5 px-2 text-[10px] uppercase tracking-wider text-ink/50 font-semibold hidden md:table-cell">Significance</th>
                  </tr>
                </thead>
                <tbody>
                  {composer.famousWorks.map((w, i) => (
                    <tr key={i} className="border-b border-gold/15 hover:bg-gold/5 transition">
                      <td className="py-2 px-2 font-semibold text-crimson">{w.title}</td>
                      <td className="py-2 px-2 text-ink/75">{w.raga}</td>
                      <td className="py-2 px-2 text-ink/75 hidden sm:table-cell">{w.tala}</td>
                      <td className="py-2 px-2 text-ink/60 text-[12px] hidden md:table-cell">{w.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Composition groups */}
            {composer.compositionGroups && (
              <div className="mt-4 space-y-2">
                <h5 className="text-[10px] uppercase tracking-[0.2em] text-saffron font-semibold mb-2">Major Composition Cycles</h5>
                {composer.compositionGroups.map((g, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Sparkles className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[13px] font-semibold text-crimson">{g.name}</span>
                      <span className="text-[12px] text-ink/65 ml-1">— {g.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* More Anecdotes */}
        {composer.anecdotes && composer.anecdotes.length > 1 && (
          <Section icon={Quote} title="Stories & Anecdotes">
            <div className="space-y-3">
              {composer.anecdotes.slice(1).map((a, i) => (
                <AnecdoteCard key={i} anecdote={a} />
              ))}
            </div>
          </Section>
        )}

        {/* Legacy */}
        {composer.legacy && (
          <Section icon={Sparkles} title="Legacy & Remembrance">
            <p className="text-ink/85 leading-relaxed text-[14px]">{composer.legacy}</p>
          </Section>
        )}
      </div>

      {/* Pilgrimage Trail — always visible */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-[0.2em] text-saffron font-semibold">Pilgrimage Trail</h4>
        <PilgrimageMap stops={composer.pilgrimage} accent={composer.accentColor} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {composer.pilgrimage.map((p, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-cream-dark border border-gold/40 text-ink/80 group relative cursor-default">
              <span className="text-crimson font-semibold">{p.town}</span> · {p.temple}
              {p.note && (
                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-ink text-cream text-[10px] whitespace-nowrap z-20 shadow-lg">
                  {p.note}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
