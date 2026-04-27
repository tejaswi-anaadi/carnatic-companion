import KatapayadiDecoder from '../components/KatapayadiDecoder.jsx'
import { useT } from '../lib/i18n.jsx'

export default function ToolsView() {
  const t = useT()
  const isSa = t.lang === 'sa'
  return (
    <div className="space-y-6">
      <header>
        <h2 className={'text-3xl md:text-4xl text-crimson font-bold ' + (isSa ? 'font-devanagari' : 'font-display')}>
          {isSa ? 'उपकरण' : 'Tools'}
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          {isSa
            ? 'प्राचीन कटपयादि सङ्ख्या से किसी भी मेलकर्ता को नाम अथवा सङ्ख्या द्वारा खोलें।'
            : 'Decode any melakartha by name or number using the ancient Katapayadi cipher.'}
        </p>
      </header>

      <KatapayadiDecoder />
    </div>
  )
}
