interface SpecItem {
  icon: string;
  label: string;
  value: string;
}

interface SpecsBentoProps {
  specs: SpecItem[];
}

export function SpecsBento({ specs }: SpecsBentoProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {specs.map((spec, i) => (
        <div
          key={i}
          className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center"
        >
          <span className="material-symbols-outlined text-primary mb-2">
            {spec.icon}
          </span>
          <span className="text-xs text-outline mb-1">{spec.label}</span>
          <span className="font-bold text-on-surface">{spec.value}</span>
        </div>
      ))}
    </section>
  );
}
