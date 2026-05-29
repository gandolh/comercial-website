import { Link } from "@core/lib/router";

export function DesprePage() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1
            className="text-4xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Despre my-olx
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed">
            Piața digitală a creatorilor români.
          </p>
        </header>

        <section className="space-y-4">
          <h2
            className="text-2xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Misiunea noastră
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            my-olx este construit pentru creatorii digitali din România — designeri,
            programatori, muzicieni, scriitori — care vor să monetizeze munca lor
            fără comisioane ascunse și fără birocrație. Credim că activele digitale
            de calitate merită o piață locală, în românește, cu prețuri în lei.
          </p>
        </section>

        <section className="space-y-4">
          <h2
            className="text-2xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Ce vindem
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: "code", label: "Software & Cod Sursă" },
              { icon: "palette", label: "Grafică & Ilustrații" },
              { icon: "description", label: "Șabloane & Documente" },
              { icon: "music_note", label: "Audio & Muzică" },
              { icon: "movie", label: "Video & Motion" },
              { icon: "menu_book", label: "E-Bookuri & Cursuri" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-surface-container rounded-xl p-4"
              >
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: "20px" }}
                >
                  {icon}
                </span>
                <span className="text-sm font-medium text-on-surface">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2
            className="text-2xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            De ce my-olx?
          </h2>
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
                <span
                  className="material-symbols-outlined text-secondary mt-0.5"
                  style={{ fontSize: "22px" }}
                >
                  {icon}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{title}</p>
                  <p className="text-on-surface-variant text-sm">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-primary-container rounded-2xl p-8 space-y-4 text-center">
          <h2
            className="text-2xl font-bold text-on-primary-container"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Ești creator? Hai alături de noi.
          </h2>
          <p className="text-on-primary-container/80">
            Înregistrează-te gratuit și postează primul tău anunț în câteva
            minute.
          </p>
          <Link
            to="/inregistrare"
            className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity"
          >
            Creează cont gratuit
          </Link>
        </section>
      </div>
    </main>
  );
}
