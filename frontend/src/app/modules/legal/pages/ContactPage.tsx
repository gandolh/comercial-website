export function ContactPage() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-3">
          <h1
            className="text-4xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Contact
          </h1>
          <p className="text-on-surface-variant text-lg">
            Suntem aici pentru a te ajuta. Alege canalul potrivit nevoii tale.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-6">
          <ContactCard
            icon="support_agent"
            title="Suport general"
            description="Probleme cu contul, descărcări, anunțuri."
            contact="suport@my-olx.ro"
            href="mailto:suport@my-olx.ro"
          />
          <ContactCard
            icon="gavel"
            title="Legal & Conformitate"
            description="Termeni, GDPR, drepturi de autor, retrageri."
            contact="legal@my-olx.ro"
            href="mailto:legal@my-olx.ro"
          />
          <ContactCard
            icon="security"
            title="Confidențialitate"
            description="Exercitare drepturi GDPR, ștergere date, portabilitate."
            contact="privacy@my-olx.ro"
            href="mailto:privacy@my-olx.ro"
          />
          <ContactCard
            icon="campaign"
            title="Parteneriate & PR"
            description="Colaborări, reclamații media, propuneri de parteneriat."
            contact="hello@my-olx.ro"
            href="mailto:hello@my-olx.ro"
          />
        </div>

        <section className="bg-surface-container rounded-2xl p-8 space-y-4">
          <h2
            className="text-xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Date de identificare
          </h2>
          <dl className="space-y-2 text-on-surface-variant text-sm leading-relaxed">
            <div className="flex gap-2">
              <dt className="font-semibold text-on-surface min-w-24">Denumire:</dt>
              <dd>SC PiațăRo SRL</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-surface min-w-24">CUI:</dt>
              <dd>RO12345678</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-surface min-w-24">Sediu:</dt>
              <dd>București, România</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-surface min-w-24">Reg. com.:</dt>
              <dd>J40/1234/2024</dd>
            </div>
          </dl>
          <p className="text-on-surface-variant text-sm mt-4">
            Informații obligatorii conform ANSPDCP și legislației privind
            comerțul electronic (Legea nr. 365/2002).
          </p>
        </section>

        <section className="space-y-3">
          <h2
            className="text-xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Timp de răspuns
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Ne străduim să răspundem la toate solicitările în termen de{" "}
            <strong className="text-on-surface">2 zile lucrătoare</strong>.
            Solicitările GDPR sunt procesate în termenul legal de 30 de zile.
            Program suport: Luni–Vineri, 09:00–18:00 (EET).
          </p>
        </section>
      </div>
    </main>
  );
}

function ContactCard({
  icon,
  title,
  description,
  contact,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  contact: string;
  href: string;
}) {
  return (
    <div className="bg-surface-container rounded-2xl p-6 space-y-3 hover:shadow-md transition-shadow">
      <span
        className="material-symbols-outlined text-primary block"
        style={{ fontSize: "28px" }}
      >
        {icon}
      </span>
      <div>
        <h3 className="font-bold text-on-surface">{title}</h3>
        <p className="text-on-surface-variant text-sm mt-1">{description}</p>
      </div>
      <a
        href={href}
        className="text-primary text-sm font-medium hover:underline break-all"
      >
        {contact}
      </a>
    </div>
  );
}
