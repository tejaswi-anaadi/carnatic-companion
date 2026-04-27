import KatapayadiDecoder from '../components/KatapayadiDecoder.jsx'

export default function ToolsView() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl md:text-4xl text-crimson font-bold">
          Tools
        </h2>
        <p className="text-ink/65 mt-1 text-sm md:text-base">
          Decode any melakartha by name or number using the ancient Katapayadi cipher.
        </p>
      </header>

      <KatapayadiDecoder />
    </div>
  )
}
