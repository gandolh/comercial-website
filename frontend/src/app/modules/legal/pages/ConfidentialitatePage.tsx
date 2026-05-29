export function ConfidentialitatePage() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1
            className="text-4xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Politică de Confidențialitate
          </h1>
          <p className="text-on-surface-variant text-sm">
            Ultima actualizare: 1 mai 2026
          </p>
        </header>

        <Section title="1. Operatorul de date">
          <p>
            <strong>SC PiațăRo SRL</strong> (denumită în continuare „my-olx",
            „noi" sau „operatorul"), cu sediul în București, România, este
            operatorul datelor tale cu caracter personal, conform Regulamentului
            (UE) 2016/679 (GDPR) și Legii nr. 190/2018.
          </p>
          <p className="mt-3">
            Contact DPO:{" "}
            <a
              href="mailto:privacy@my-olx.ro"
              className="text-primary hover:underline"
            >
              privacy@my-olx.ro
            </a>
          </p>
        </Section>

        <Section title="2. Date colectate și scopul prelucrării">
          <div className="space-y-4">
            <DataRow
              category="Date de cont"
              data="Adresă email, parolă (criptată), dată înregistrare"
              basis="Contract (art. 6(1)(b) GDPR)"
              retention="Pe durata contului + 3 ani după ștergere"
            />
            <DataRow
              category="Date de profil"
              data="Numele afișat, biografie, link-uri sociale, număr telefon"
              basis="Consimțământ (art. 6(1)(a) GDPR)"
              retention="Pe durata contului"
            />
            <DataRow
              category="Date tranzacții"
              data="Anunțuri postate, achizții efectuate, fișiere descărcate"
              basis="Contract (art. 6(1)(b) GDPR)"
              retention="7 ani (obligații contabile)"
            />
            <DataRow
              category="Date tehnice"
              data="Adresă IP, browser, cookie-uri sesiune"
              basis="Interes legitim (art. 6(1)(f) GDPR)"
              retention="30 de zile"
            />
            <DataRow
              category="Comunicări"
              data="Mesaje între cumpărători și vânzători în platformă"
              basis="Contract (art. 6(1)(b) GDPR)"
              retention="2 ani după ultima activitate"
            />
          </div>
        </Section>

        <Section title="3. Cookie-uri">
          <p>
            Utilizăm cookie-uri esențiale pentru funcționarea platformei
            (autentificare, sesiune) și cookie-uri opționale de analiză. Poți
            gestiona preferințele tale de cookie-uri prin bannerul afișat la
            prima vizită sau în orice moment prin{" "}
            <a href="/politica-cookies" className="text-primary hover:underline">
              Politica de Cookies
            </a>
            .
          </p>
        </Section>

        <Section title="4. Drepturile tale">
          <ul className="space-y-2">
            {[
              {
                right: "Acces",
                desc: "Poți solicita o copie a datelor pe care le deținem despre tine.",
              },
              {
                right: "Rectificare",
                desc: "Poți corecta datele incorecte sau incomplete.",
              },
              {
                right: "Ștergere",
                desc: 'Poți solicita ștergerea datelor ("dreptul de a fi uitat"), cu excepțiile prevăzute de lege.',
              },
              {
                right: "Restricționare",
                desc: "Poți solicita limitarea prelucrării în anumite circumstanțe.",
              },
              {
                right: "Portabilitate",
                desc: "Poți primi datele tale în format structurat, lizibil automat.",
              },
              {
                right: "Opoziție",
                desc: "Poți obiecta față de prelucrarea bazată pe interesul nostru legitim.",
              },
              {
                right: "Retragere consimțământ",
                desc: "Poți retrage consimțământul în orice moment, fără a afecta legalitatea prelucrării anterioare.",
              },
            ].map(({ right, desc }) => (
              <li key={right} className="flex gap-2">
                <span className="font-semibold text-on-surface min-w-fit">
                  {right}:
                </span>
                <span>{desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Pentru exercitarea drepturilor, contactează-ne la{" "}
            <a
              href="mailto:privacy@my-olx.ro"
              className="text-primary hover:underline"
            >
              privacy@my-olx.ro
            </a>
            . Vei primi răspuns în cel mult 30 de zile.
          </p>
        </Section>

        <Section title="5. Partajarea datelor cu terți">
          <p>
            Nu vindem datele tale personale. Putem partaja date cu:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Furnizori de servicii tehnice (hosting, email tranzacțional)</li>
            <li>Autorități publice, în cazul obligațiilor legale</li>
            <li>Procesatori de plăți, pentru finalizarea tranzacțiilor</li>
          </ul>
          <p className="mt-3">
            Toți partenerii sunt obligați contractual să respecte GDPR.
          </p>
        </Section>

        <Section title="6. Transferuri internaționale">
          <p>
            Datele tale sunt procesate în principal pe servere situate în UE.
            Orice transfer în afara UE se efectuează în baza clauzelor
            contractuale standard aprobate de Comisia Europeană.
          </p>
        </Section>

        <Section title="7. Plângeri">
          <p>
            Dacă consideri că drepturile tale au fost încălcate, poți depune o
            plângere la:
          </p>
          <p className="mt-3">
            <strong>
              Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
              Caracter Personal (ANSPDCP)
            </strong>
            <br />
            B-dul G-ral. Gheorghe Magheru nr. 28-30, sector 1, București
            <br />
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.dataprotection.ro
            </a>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2
        className="text-xl font-bold text-on-surface"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {title}
      </h2>
      <div className="text-on-surface-variant leading-relaxed">{children}</div>
    </section>
  );
}

function DataRow({
  category,
  data,
  basis,
  retention,
}: {
  category: string;
  data: string;
  basis: string;
  retention: string;
}) {
  return (
    <div className="bg-surface-container rounded-xl p-4 space-y-1">
      <p className="font-semibold text-on-surface">{category}</p>
      <p className="text-sm">
        <span className="text-on-surface-variant">Date: </span>
        {data}
      </p>
      <p className="text-sm">
        <span className="text-on-surface-variant">Temei legal: </span>
        {basis}
      </p>
      <p className="text-sm">
        <span className="text-on-surface-variant">Retenție: </span>
        {retention}
      </p>
    </div>
  );
}
