import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Panel } from "./Panel";

interface Feature {
  icon: string;
  label: string;
  value: string;
}

interface ListingDescriptionProps {
  id: string;
  description: string;
  /** Absent on a draft preview, which has not been posted. */
  postedAt?: string;
  features: Feature[];
  digitalSpecs?: Feature[];
  className?: string;
}

export function ListingDescription({
  id,
  description,
  postedAt,
  features,
  digitalSpecs = [],
  className,
}: ListingDescriptionProps) {
  const paragraphs = description.split("\n\n").filter(Boolean);
  const allSpecs = [...features, ...digitalSpecs];

  return (
    <Panel aria-labelledby="description-title" className={className}>
      <div className="border-b border-outline-variant pb-3">
        <h2 id="description-title" className="text-price font-extrabold text-on-surface">
          Descriere
        </h2>
      </div>

      {paragraphs.slice(0, 1).map((p, i) => (
        <p key={i} className="max-w-[70ch] text-on-surface-variant">
          {p}
        </p>
      ))}

      {allSpecs.length > 0 && (
        <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-3 p-0">
          {allSpecs.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-[10px] bg-surface-container-low px-3.5 py-3">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                {f.icon}
              </span>
              <div>
                <span className="block text-control text-on-surface-variant">{f.label}</span>
                <span className="block font-extrabold text-on-surface">{f.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {paragraphs.slice(1).map((p, i) => (
        <p key={i + 1} className="max-w-[70ch] text-on-surface-variant">
          {p}
        </p>
      ))}

      <p className="text-label [overflow-wrap:anywhere] text-on-surface-variant tabular-nums">
        {postedAt && `Postat la: ${format(new Date(postedAt), "d MMMM yyyy, HH:mm", { locale: ro })} · `}ID: {id}
      </p>
    </Panel>
  );
}
