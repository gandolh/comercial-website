export function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-310 px-4 pt-10 pb-20 md:px-6">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-3">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface">Contact</h1>
          <p className="text-lg text-on-surface-variant">
            Suntem aici pentru a te ajuta. Alege canalul potrivit nevoii tale.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
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

        <section className="space-y-4 rounded-2xl bg-surface-container p-8">
          <h2 className="font-headline text-xl font-bold text-on-surface">Date de identificare</h2>
          <dl className="space-y-2 text-sm leading-relaxed text-on-surface-variant">
            <div className="flex gap-2">
              <dt className="min-w-24 font-semibold text-on-surface">Denumire:</dt>
              <dd>SC PiațăRo SRL</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-24 font-semibold text-on-surface">CUI:</dt>
              <dd>RO12345678</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-24 font-semibold text-on-surface">Sediu:</dt>
              <dd>București, România</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-24 font-semibold text-on-surface">Reg. com.:</dt>
              <dd>J40/1234/2024</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-on-surface-variant">
            Informații obligatorii conform ANSPDCP și legislației privind comerțul electronic (Legea nr. 365/2002).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-on-surface">Timp de răspuns</h2>
          <p className="leading-relaxed text-on-surface-variant">
            Ne străduim să răspundem la toate solicitările în termen de{" "}
            <strong className="text-on-surface">2 zile lucrătoare</strong>. Solicitările GDPR sunt procesate în termenul
            legal de 30 de zile. Program suport: Luni–Vineri, 09:00–18:00 (EET).
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
    <div className="space-y-3 rounded-2xl bg-surface-container p-6 transition-shadow hover:shadow-md">
      <span className="material-symbols-outlined block text-primary" style={{ fontSize: "28px" }}>
        {icon}
      </span>
      <div>
        <h3 className="font-bold text-on-surface">{title}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      </div>
      <a href={href} className="text-sm font-medium break-all text-primary hover:underline">
        {contact}
      </a>
    </div>
  );
}
