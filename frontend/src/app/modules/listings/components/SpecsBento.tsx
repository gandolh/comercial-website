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
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {specs.map((spec, i) => (
        <div key={i} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-6 text-center">
          <span className="material-symbols-outlined mb-2 text-primary">{spec.icon}</span>
          <span className="mb-1 text-xs text-on-surface-variant">{spec.label}</span>
          <span className="font-bold text-on-surface">{spec.value}</span>
        </div>
      ))}
    </section>
  );
}
