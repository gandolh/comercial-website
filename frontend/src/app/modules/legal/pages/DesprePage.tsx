import { Link } from "@core/lib/router";

export function DesprePage() {
  return (
    <main className="mx-auto w-full max-w-310 px-4 pt-10 pb-20 md:px-6">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface">Despre my-olx</h1>
          <p className="text-xl leading-relaxed text-on-surface-variant">Piața digitală a creatorilor români.</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Misiunea noastră</h2>
          <p className="leading-relaxed text-on-surface-variant">
            my-olx este construit pentru creatorii digitali din România — designeri, programatori, muzicieni, scriitori
            — care vor să monetizeze munca lor fără comisioane ascunse și fără birocrație. Credim că activele digitale
            de calitate merită o piață locală, în românește, cu prețuri în lei.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Ce vindem</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: "code", label: "Software & Cod Sursă" },
              { icon: "palette", label: "Grafică & Ilustrații" },
              { icon: "description", label: "Șabloane & Documente" },
              { icon: "music_note", label: "Audio & Muzică" },
              { icon: "movie", label: "Video & Motion" },
              { icon: "menu_book", label: "E-Bookuri & Cursuri" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-surface-container p-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  {icon}
                </span>
                <span className="text-sm font-medium text-on-surface">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-headline text-2xl font-bold text-on-surface">De ce my-olx?</h2>
          <ul className="space-y-3">
            {[
              {
                icon: "bolt",
                title: "Publicare rapidă",
                desc: "Anunțul tău apare în mai puțin de 3 minute.",
              },
              {
                icon: "lock",
                title: "Descărcări protejate",
                desc: "Fișierele tale sunt accesibile doar cumpărătorilor autorizați.",
              },
              {
                icon: "language",
                title: "Totul în românește",
                desc: "Interfață, suport și prețuri adaptate pieței locale.",
              },
              {
                icon: "verified",
                title: "Vânzători verificați",
                desc: "Conturile verificate primesc insigna de încredere.",
              },
            ].map(({ icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="material-symbols-outlined mt-0.5 text-primary" style={{ fontSize: "22px" }}>
                  {icon}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{title}</p>
                  <p className="text-sm text-on-surface-variant">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl bg-primary-container p-8 text-center">
          <h2 className="font-headline text-2xl font-bold text-on-primary-container">PiațăRo este o demonstrație.</h2>
          <p className="text-on-primary-container/80">
            Conturile noi nu sunt deschise, iar plățile sunt simulate. Poți răsfoi toate anunțurile.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-control bg-primary px-8 py-3 font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
          >
            Vezi anunțurile
          </Link>
        </section>
      </div>
    </main>
  );
}
