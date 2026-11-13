const CATEGORIES = [
  { icon: "palette", label: "Grafică & Ilustrații", slug: "grafica" },
  { icon: "dashboard_customize", label: "Șabloane & Template-uri", slug: "sabloane" },
  { icon: "apps", label: "Software & Aplicații", slug: "software" },
  { icon: "terminal", label: "Cod Sursă", slug: "cod-sursa" },
  { icon: "music_note", label: "Audio & Muzică", slug: "audio" },
  { icon: "movie", label: "Video & Motion", slug: "video" },
  { icon: "menu_book", label: "E-Bookuri & Cursuri", slug: "ebook" },
  { icon: "font_download", label: "Fonturi", slug: "fonturi" },
  { icon: "description", label: "Documente & Template-uri Legale", slug: "documente" },
  { icon: "view_in_ar", label: "Modele 3D & AR", slug: "3d" },
  { icon: "brush", label: "Artizanat Digital", slug: "mestesugart" },
  { icon: "celebration", label: "Invitații Digitale", slug: "invitatii" },
  { icon: "category", label: "Diverse", slug: "diverse" },
];

interface CategoryStepProps {
  onSelect: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryStep({ onSelect, selectedCategory }: CategoryStepProps) {
  return (
    <div className="space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-extrabold">Ce vinzi astăzi?</h2>
        <p className="text-on-surface-variant">Alege categoria care se potrivește cel mai bine anunțului tău.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {CATEGORIES.map(({ icon, label, slug }) => (
          <button
            key={slug}
            onClick={() => onSelect(slug)}
            className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 text-center transition-all ${
              selectedCategory === slug
                ? "border-primary bg-primary-container text-on-primary-container shadow-md"
                : "border-transparent bg-surface-container-low hover:border-outline-variant hover:shadow-band"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                selectedCategory === slug
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                {icon}
              </span>
            </div>
            <span className="text-sm leading-tight font-bold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
