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

export function CategoryStep({
  onSelect,
  selectedCategory,
}: CategoryStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Ce vinzi astăzi?
        </h2>
        <p className="text-on-surface-variant">
          Alege categoria care se potrivește cel mai bine anunțului tău.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map(({ icon, label, slug }) => (
          <button
            key={slug}
            onClick={() => onSelect(slug)}
            className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all group cursor-pointer border-2 ${
              selectedCategory === slug
                ? "bg-primary-container border-primary text-on-primary-container shadow-md"
                : "bg-surface-container-low border-transparent hover:border-outline-variant hover:shadow-lg"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                selectedCategory === slug
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-primary group-hover:bg-primary group-hover:text-on-primary"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px" }}
              >
                {icon}
              </span>
            </div>
            <span className="font-bold text-sm leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
