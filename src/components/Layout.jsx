import { Music2, Drum, ScrollText, Wrench, Sparkles, Languages } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'

const TABS = [
  { id: 'ragas',   label: 'Ragas',   labelSa: 'राग',   icon: Music2 },
  { id: 'talas',   label: 'Talas',   labelSa: 'ताल',   icon: Drum },
  { id: 'history', label: 'History', labelSa: 'इतिहास', icon: ScrollText },
  { id: 'tools',   label: 'Tools',   labelSa: 'उपकरण',  icon: Wrench },
]

function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLanguage()
  const isSa = lang === 'sa'
  return (
    <button
      onClick={() => setLang(isSa ? 'en' : 'sa')}
      className={
        'group flex items-center gap-2 px-3 py-2 rounded-full border-2 transition text-sm font-semibold ' +
        (isSa
          ? 'bg-gold text-crimson-dark border-gold-dark shadow-temple'
          : 'bg-cream/95 text-crimson border-gold/60 hover:border-gold hover:bg-gold/30 ') +
        className
      }
      title={isSa ? 'Switch to English' : 'संस्कृत में देखें / Switch to Sanskrit'}
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className={!isSa ? 'font-bold' : 'opacity-65'}>EN</span>
      <span className="opacity-40">·</span>
      <span className={isSa ? 'font-bold' : 'opacity-65'} style={{ fontFamily: '"Noto Sans Devanagari", "Sanskrit Text", serif' }}>
        सं
      </span>
    </button>
  )
}

export default function Layout({ active, onChange, children }) {
  const { lang } = useLanguage()
  return (
    <div className="min-h-full md:flex">
      {/* Sidebar (md+) */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-crimson text-cream border-r-4 border-gold relative">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-gold via-saffron to-gold" />
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-gold/90 uppercase tracking-[0.2em] text-xs">Companion</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cream leading-tight">
            Carnatic
            <span className="block text-gold-light italic font-medium">Companion</span>
          </h1>
          <p className="text-cream/70 text-xs mt-3 leading-snug">
            Ragas, talas, and the trinity, in your pocket.
          </p>
        </div>

        <nav className="px-4 flex flex-col gap-1 mt-2">
          {TABS.map(({ id, label, labelSa, icon: Icon }) => {
            const isActive = active === id
            const display = lang === 'sa' ? labelSa : label
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={
                  'group flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ' +
                  (isActive
                    ? 'bg-gold text-crimson-dark shadow-[inset_0_-2px_0_0_#A67D32] font-semibold'
                    : 'text-cream/85 hover:bg-crimson-dark/60')
                }
              >
                <Icon className={'w-5 h-5 ' + (isActive ? 'text-crimson-dark' : 'text-gold')} />
                <span className="font-medium">{display}</span>
              </button>
            )
          })}
        </nav>

        <div className="px-4 mt-4">
          <LanguageToggle className="w-full justify-center" />
        </div>

        <div className="mt-auto px-6 py-6 text-cream/60 text-xs leading-relaxed">
          <div className="border-t border-gold/30 pt-4">
            <p className="italic">"Sangeetha jnanamu bhakti vina<br/>sanmargamu galade?"</p>
            <p className="text-gold/80 mt-1">— Sri Tyagaraja</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 bg-crimson text-cream px-4 py-3 border-b-4 border-gold flex items-center gap-2 shadow">
          <Sparkles className="w-5 h-5 text-gold shrink-0" />
          <h1 className="font-display text-xl font-bold flex-1 truncate">
            {lang === 'sa' ? 'कर्णाटक सङ्गीत साथी' : 'Carnatic Companion'}
          </h1>
          <LanguageToggle />
        </header>

        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-crimson border-t-4 border-gold flex">
        {TABS.map(({ id, label, labelSa, icon: Icon }) => {
          const isActive = active === id
          const display = lang === 'sa' ? labelSa : label
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={
                'flex-1 py-3 flex flex-col items-center gap-1 text-xs transition ' +
                (isActive ? 'text-gold-light' : 'text-cream/70')
              }
            >
              <Icon className={'w-5 h-5 ' + (isActive ? 'drop-shadow-[0_0_6px_rgba(212,162,76,0.7)]' : '')} />
              <span className={isActive ? 'font-semibold' : ''}>{display}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
