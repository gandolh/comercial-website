interface Feature {
  icon: string
  label: string
  value: string
}

interface ListingDescriptionProps {
  id: string
  description: string
  features: Feature[]
  digitalSpecs?: Feature[]
}

export function ListingDescription({ id, description, features, digitalSpecs = [] }: ListingDescriptionProps) {
  const paragraphs = description.split('\n\n').filter(Boolean)
  const allSpecs = [...features, ...digitalSpecs]

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
          Descriere
        </h2>
        <span className="text-xs font-bold tracking-widest text-outline uppercase">ID: {id}</span>
      </div>

      <div className="space-y-4 text-on-surface-variant leading-relaxed">
        {paragraphs.slice(0, 1).map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {allSpecs.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
            {allSpecs.map((f, i) => (
              <li key={i} className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl">
                <span className="material-symbols-outlined text-secondary">{f.icon}</span>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-outline">{f.label}</span>
                  <span className="font-bold text-on-surface">{f.value}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {paragraphs.slice(1).map((p, i) => (
          <p key={i + 1}>{p}</p>
        ))}
      </div>
    </section>
  )
}
