import { PAGE_TITLE } from "@core/components/brand";

export function TermeniPage() {
  return (
    <main className="mx-auto w-full max-w-310 px-4 pt-10 pb-20 md:px-6">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <h1 className={`${PAGE_TITLE} text-4xl text-on-surface max-md:text-[28px] max-md:leading-9`}>
            Termeni și Condiții
          </h1>
          <p className="text-sm text-on-surface-variant">Ultima actualizare: 1 mai 2026</p>
        </header>

        <Section title="1. Despre Mercatus">
          <p>
            Mercatus este o platformă online de comercializare a activelor digitale, operată de SC Mercatus SRL, cu
            sediul în România. Platforma permite vânzătorilor să încarce și să vândă fișiere descărcabile (software,
            grafică, șabloane, audio, video, e-bookuri, fonturi, cod sursă și altele), iar cumpărătorilor să le
            achiziționeze și descărce.
          </p>
        </Section>

        <Section title="2. Acceptarea termenilor">
          <p>
            Prin accesarea și utilizarea platformei Mercatus, ești de acord cu prezentele Termeni și Condiții. Dacă nu
            ești de acord, nu utiliza serviciile noastre. Utilizatorii minori (sub 18 ani) trebuie să obțină acordul
            unui tutore legal.
          </p>
        </Section>

        <Section title="3. Conținut digital și livrare">
          <p>
            Activele digitale achiziționate sunt livrate exclusiv prin descărcare electronică, imediat după confirmarea
            plății. Nu există livrare fizică. Fișierele sunt disponibile în contul tău pentru o perioadă nedeterminată
            după achiziție.
          </p>
          <p className="mt-3">
            Formatul și dimensiunea fiecărui fișier sunt indicate pe pagina anunțului. Mercatus nu garantează
            compatibilitatea fișierelor cu sisteme sau software terțe.
          </p>
        </Section>

        <Section title="4. Dreptul de retragere (OUG nr. 34/2014)">
          <p>
            În conformitate cu art. 9 alin. (1) din OUG nr. 34/2014, ai dreptul de a te retrage dintr-un contract la
            distanță în termen de <strong>14 zile calendaristice</strong>, fără a justifica decizia și fără costuri
            suplimentare, <em>cu excepția</em> contractelor de furnizare de conținut digital care nu este livrat pe un
            suport material (art. 16 alin. (1) lit. m)), dacă executarea a început și sunt îndeplinite toate cele trei
            condiții:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-on-surface-variant">
            <li>ți-ai dat acordul prealabil expres pentru începerea descărcării în cursul perioadei de retragere,</li>
            <li>ai confirmat că ai luat cunoștință de faptul că îți vei pierde astfel dreptul de retragere, și</li>
            <li>
              Mercatus ți-a trimis confirmarea încheierii contractului, conform art. 7 alin. (2) sau art. 8 alin. (7)
              din aceeași ordonanță.
            </li>
          </ul>
        </Section>

        <Section title="5. Prețuri și monedă">
          <p>
            Toate prețurile sunt exprimate în lei românești (RON) și includ TVA acolo unde este aplicabil. Unele active
            sunt gratuite. Prețurile pot fi modificate de vânzători fără notificare prealabilă, dar nu afectează
            achizițiile deja finalizate.
          </p>
        </Section>

        <Section title="6. Proprietate intelectuală și licențe">
          <p>
            Achizitionând un activ digital, dobândești o licență de utilizare conform termenilor specificați de vânzător
            (personală, comercială sau extinsă). Nu dobândești dreptul de autor sau proprietatea intelectuală asupra
            activului. Revânzarea, redistribuirea sau sublicențierea fără acordul explicit al vânzătorului este
            interzisă.
          </p>
        </Section>

        <Section title="7. Răspundere">
          <p>
            Mercatus este o platformă intermediară și nu poartă răspundere pentru conținutul activelor digitale
            publicate de vânzători. Vânzătorii sunt singurii responsabili pentru acuratețea descrierilor și drepturile
            de autor.
          </p>
        </Section>

        <Section title="8. Soluționarea litigiilor">
          <p>Eventualele litigii vor fi soluționate pe cale amiabilă. Dacă nu este posibil, te poți adresa:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-on-surface-variant">
            <li>
              <strong>ANPC</strong> — Autoritatea Națională pentru Protecția Consumatorilor, str. Gheorghe Manu nr. 28,
              sector 1, București
            </li>
            <li>
              <strong>SAL</strong> — Soluționarea Alternativă a Litigiilor, procedura prevăzută de OG nr. 38/2015, prin
              platforma ANPC:
              <a
                href="https://reclamatiisal.anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline"
              >
                reclamatiisal.anpc.ro
              </a>
            </li>
          </ul>
        </Section>

        <Section title="9. Modificarea termenilor">
          <p>
            Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările vor fi publicate pe această
            pagină cu indicarea datei ultimei actualizări. Continuarea utilizării platformei după publicarea
            modificărilor constituie acceptarea acestora.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Pentru întrebări legate de acești termeni, ne poți contacta la:{" "}
            <a href="mailto:legal@mercatus.example" className="text-primary hover:underline">
              legal@mercatus.example
            </a>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className={`${PAGE_TITLE} text-xl text-on-surface`}>{title}</h2>
      <div className="leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  );
}
