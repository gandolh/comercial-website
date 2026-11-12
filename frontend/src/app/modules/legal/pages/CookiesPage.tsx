export function CookiesPage() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 pt-28 pb-20 md:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <h1 className="font-headline text-4xl font-black text-on-surface">Politică de Cookies</h1>
          <p className="text-sm text-on-surface-variant">Ultima actualizare: 1 mai 2026</p>
        </header>

        <Section title="Ce sunt cookie-urile?">
          <p>
            Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul tău atunci când vizitezi un site
            web. Ele permit site-ului să rețină anumite informații despre sesiunea ta sau preferințele tale.
          </p>
        </Section>

        <Section title="Ce cookie-uri folosim">
          <div className="space-y-4">
            <CookieRow
              name="Esențiale (obligatorii)"
              purpose="Autentificare, sesiune, securitate CSRF"
              duration="Sesiune / 30 de zile"
              canReject={false}
            />
            <CookieRow
              name="Funcționale"
              purpose="Preferințe UI (limbă, temă), istoricul căutărilor recente"
              duration="1 an"
              canReject={true}
            />
            <CookieRow
              name="Analitice"
              purpose="Statistici de trafic anonimizate (pagini vizitate, timp pe site)"
              duration="90 de zile"
              canReject={true}
            />
          </div>
        </Section>

        <Section title="Cum gestionezi preferințele">
          <p>
            La prima vizită pe site, vei vedea un banner de consimțământ care îți permite să accepți sau să respingi
            cookie-urile opționale. Poți modifica această alegere oricând:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>Prin butonul „Gestionează cookie-urile" din subsolul paginii</li>
            <li>Prin setările browserului tău (instrucțiuni mai jos)</li>
          </ul>
        </Section>

        <Section title="Setări browser">
          <p>Poți șterge sau bloca cookie-urile din setările browserului:</p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri și alte date de site
            </li>
            <li>
              <strong>Firefox:</strong> Opțiuni → Confidențialitate și securitate → Cookie-uri și date de site
            </li>
            <li>
              <strong>Safari:</strong> Preferințe → Confidențialitate → Gestionare date site
            </li>
            <li>
              <strong>Edge:</strong> Setări → Cookie-uri și permisiuni site
            </li>
          </ul>
          <p className="mt-3">
            Reține că blocarea cookie-urilor esențiale poate afecta funcționalitatea platformei (de ex., nu te vei putea
            autentifica).
          </p>
        </Section>

        <Section title="Legislație aplicabilă">
          <p>
            Această politică respectă prevederile Legii nr. 506/2004 privind prelucrarea datelor cu caracter personal și
            protecția vieții private în sectorul comunicațiilor electronice, cu modificările ulterioare, și Regulamentul
            (UE) 2016/679 (GDPR).
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pentru întrebări referitoare la utilizarea cookie-urilor, scrie-ne la{" "}
            <a href="mailto:privacy@my-olx.ro" className="text-primary hover:underline">
              privacy@my-olx.ro
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-headline text-xl font-bold text-on-surface">{title}</h2>
      <div className="leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  );
}

function CookieRow({
  name,
  purpose,
  duration,
  canReject,
}: {
  name: string;
  purpose: string;
  duration: string;
  canReject: boolean;
}) {
  return (
    <div className="space-y-1 rounded-xl bg-surface-container p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-on-surface">{name}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            canReject
              ? "bg-tertiary-container text-on-tertiary-container"
              : "bg-secondary-container text-on-secondary-container"
          }`}
        >
          {canReject ? "Opțional" : "Necesar"}
        </span>
      </div>
      <p className="text-sm">
        <span className="text-on-surface-variant">Scop: </span>
        {purpose}
      </p>
      <p className="text-sm">
        <span className="text-on-surface-variant">Durată: </span>
        {duration}
      </p>
    </div>
  );
}
