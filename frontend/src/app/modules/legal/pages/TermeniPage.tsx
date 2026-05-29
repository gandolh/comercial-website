export function TermeniPage() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1
            className="text-4xl font-black text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Termeni și Condiții
          </h1>
          <p className="text-on-surface-variant text-sm">
            Ultima actualizare: 1 mai 2026
          </p>
        </header>

        <Section title="1. Despre my-olx">
          <p>
            my-olx este o platformă online de comercializare a activelor
            digitale, operată de SC PiațăRo SRL, cu sediul în România.
            Platforma permite vânzătorilor să încarce și să vândă fișiere
            descărcabile (software, grafică, șabloane, audio, video, e-bookuri,
            fonturi, cod sursă și altele), iar cumpărătorilor să le achiziționeze
            și descărce.
          </p>
        </Section>

        <Section title="2. Acceptarea termenilor">
          <p>
            Prin accesarea și utilizarea platformei my-olx, ești de acord cu
            prezentele Termeni și Condiții. Dacă nu ești de acord, nu utiliza
            serviciile noastre. Utilizatorii minori (sub 18 ani) trebuie să
            obțină acordul unui tutore legal.
          </p>
        </Section>

        <Section title="3. Conținut digital și livrare">
          <p>
            Activele digitale achiziționate sunt livrate exclusiv prin descărcare
            electronică, imediat după confirmarea plății. Nu există livrare
            fizică. Fișierele sunt disponibile în contul tău pentru o perioadă
            nedeterminată după achiziție.
          </p>
          <p className="mt-3">
            Formatul și dimensiunea fiecărui fișier sunt indicate pe pagina
            anunțului. my-olx nu garantează compatibilitatea fișierelor cu
            sisteme sau software terțe.
          </p>
        </Section>

        <Section title="4. Dreptul de retragere (GEO 141/2021)">
          <p>
            În conformitate cu GEO 141/2021, ai dreptul de a te retrage dintr-un
            contract de conținut digital în termen de{" "}
            <strong>14 zile calendaristice</strong> de la data achiziției, fără
            a preciza motive și fără costuri suplimentare, <em>cu excepția</em>{" "}
            cazului în care:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-on-surface-variant">
            <li>
              Ai consimțit expres că livrarea conținutului digital începe
              imediat după achiziție, și
            </li>
            <li>
              Ai confirmat că ai înțeles că dreptul de retragere se pierde în
              momentul în care descărcarea a început.
            </li>
          </ul>
          <p className="mt-3">
            Prin inițierea descărcării, confirmi pierderea dreptului de
            retragere conform condițiilor de mai sus.
          </p>
        </Section>

        <Section title="5. Prețuri și monedă">
          <p>
            Toate prețurile sunt exprimate în lei românești (RON) și includ TVA
            acolo unde este aplicabil. Unele active sunt gratuite. Prețurile pot
            fi modificate de vânzători fără notificare prealabilă, dar nu
            afectează achizițiile deja finalizate.
          </p>
        </Section>

        <Section title="6. Proprietate intelectuală și licențe">
          <p>
            Achizitionând un activ digital, dobândești o licență de utilizare
            conform termenilor specificați de vânzător (personală, comercială sau
            extinsă). Nu dobândești dreptul de autor sau proprietatea intelectuală
            asupra activului. Revânzarea, redistribuirea sau sublicențierea fără
            acordul explicit al vânzătorului este interzisă.
          </p>
        </Section>

        <Section title="7. Răspundere">
          <p>
            my-olx este o platformă intermediară și nu poartă răspundere pentru
            conținutul activelor digitale publicate de vânzători. Vânzătorii
            sunt singurii responsabili pentru acuratețea descrierilor și
            drepturile de autor.
          </p>
        </Section>

        <Section title="8. Soluționarea litigiilor">
          <p>
            Eventualele litigii vor fi soluționate pe cale amiabilă. Dacă nu
            este posibil, te poți adresa:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-on-surface-variant">
            <li>
              <strong>ANPC</strong> — Autoritatea Națională pentru Protecția
              Consumatorilor, str. Gheorghe Manu nr. 28, sector 1, București
            </li>
            <li>
              <strong>SAL</strong> — Soluționare Alternativă a Litigiilor:
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary ml-1 hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>
            </li>
          </ul>
        </Section>

        <Section title="9. Modificarea termenilor">
          <p>
            Ne rezervăm dreptul de a modifica acești termeni în orice moment.
            Modificările vor fi publicate pe această pagină cu indicarea datei
            ultimei actualizări. Continuarea utilizării platformei după publicarea
            modificărilor constituie acceptarea acestora.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Pentru întrebări legate de acești termeni, ne poți contacta la:{" "}
            <a
              href="mailto:legal@my-olx.ro"
              className="text-primary hover:underline"
            >
              legal@my-olx.ro
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
