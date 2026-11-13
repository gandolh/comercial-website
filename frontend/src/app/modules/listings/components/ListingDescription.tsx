interface Feature {
  icon: string;
  label: string;
  value: string;
}

interface ListingDescriptionProps {
  id: string;
  description: string;
  features: Feature[];
  digitalSpecs?: Feature[];
}

export function ListingDescription({ id, description, features, digitalSpecs = [] }: ListingDescriptionProps) {
  const paragraphs = description.split("\n\n").filter(Boolean);
  const allSpecs = [...features, ...digitalSpecs];

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <h2 className="font-headline text-2xl font-bold">Descriere</h2>
        <span className="text-xs font-bold tracking-widest text-outline uppercase">ID: {id}</span>
      </div>

      <div className="space-y-4 leading-relaxed text-on-surface-variant">
        {paragraphs.slice(0, 1).map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {allSpecs.length > 0 && (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {allSpecs.map((f, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
                <span className="material-symbols-outlined text-primary">{f.icon}</span>
                <div>
                  <span className="block text-[10px] tracking-wider text-outline uppercase">{f.label}</span>
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
  );
}
