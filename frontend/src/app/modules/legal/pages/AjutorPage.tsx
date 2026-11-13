import { useState } from "react";
import { Accordion, AccordionItem } from "@core/components/ui";

const FAQ_ITEMS = [
  {
    category: "Cont și autentificare",
    questions: [
      {
        q: "Cum îmi creez un cont?",
        a: 'Apasă butonul „Înregistrare" din bara de navigare, completează adresa de email și parola, apoi confirmă adresa din emailul primit.',
      },
      {
        q: "Am uitat parola. Ce fac?",
        a: 'Pe pagina de autentificare, apasă „Am uitat parola" și introdu adresa de email. Vei primi un link de resetare în câteva minute. Verifică și folderul Spam.',
      },
      {
        q: "Pot avea mai multe conturi?",
        a: "Nu. Fiecare utilizator poate deține un singur cont activ. Conturile duplicate pot fi suspendate.",
      },
    ],
  },
  {
    category: "Postarea anunțurilor",
    questions: [
      {
        q: "Câte anunțuri pot posta?",
        a: "Conturile gratuite pot posta maximum 5 anunțuri pe săptămână. Limita se resetează automat la 7 zile de la primul anunț din perioadă.",
      },
      {
        q: "Cât timp rămâne activ un anunț?",
        a: "Anunțurile sunt active timp de 30 de zile. Le poți reînnoi din panoul de control cu 7 zile înainte de expirare.",
      },
      {
        q: "Ce tipuri de fișiere pot încărca?",
        a: "Acceptăm ZIP, PDF, PSD, AI, EPUB, MP3, WAV, MP4, MOV, OTF, TTF, și multe altele. Dimensiunea maximă per fișier este de 500 MB.",
      },
      {
        q: "Anunțul meu necesită obligatoriu un fișier?",
        a: "Da. Pentru a publica un anunț de active digitale, trebuie să încarci cel puțin un fișier descărcabil. Imaginile de previzualizare sunt opționale.",
      },
    ],
  },
  {
    category: "Cumpărare și descărcări",
    questions: [
      {
        q: "Cum descarc un activ achiziționat?",
        a: "După achiziție, butonul de descărcare apare pe pagina anunțului. Fișierul este disponibil și în istoricul de achiziții din contul tău.",
      },
      {
        q: "Pot descărca de mai multe ori?",
        a: "Da, activele achiziționate pot fi descărcate nelimitat din contul tău.",
      },
      {
        q: "Ce înseamnă licență personală vs. comercială?",
        a: "Licența personală permite utilizarea în proiecte non-comerciale. Licența comercială permite utilizarea în produse sau servicii vândute. Licența extinsă include drepturi suplimentare (redistribuire etc.) — verifică detaliile pe fiecare anunț.",
      },
    ],
  },
  {
    category: "Plăți și facturare",
    questions: [
      {
        q: "Ce metode de plată acceptați?",
        a: "Acceptăm card bancar (Visa, Mastercard) și transfer bancar. Mai multe metode vor fi adăugate în curând.",
      },
      {
        q: "Cum primesc factura?",
        a: "Factura fiscală se generează automat și este trimisă pe email după fiecare achiziție. O poți descărca și din contul tău.",
      },
    ],
  },
  {
    category: "Siguranță și raportare",
    questions: [
      {
        q: "Cum raportez un anunț suspect?",
        a: 'Pe fiecare pagina de anunt exista butonul "Raporteaza". Selecteaza motivul si trimite raportul - echipa noastra va analiza in maxim 48 de ore.',
      },
      {
        q: "Ce fac dacă un fișier descărcat conține malware?",
        a: "Contactează-ne imediat la suport@my-olx.ro cu dovezile necesare. Vom suspenda anunțul și vom procesa rambursarea.",
      },
    ],
  },
];

export function AjutorPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-310 px-4 pt-10 pb-20 md:px-6">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-3">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface">Ajutor & Întrebări Frecvente</h1>
          <p className="text-lg text-on-surface-variant">Găsești răspunsuri rapide la cele mai comune întrebări.</p>
        </header>

        <Accordion
          className="space-y-10"
          value={openItem ? [openItem] : []}
          onValueChange={(open) => setOpenItem(open[0] ?? null)}
        >
          {FAQ_ITEMS.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="border-b border-outline-variant pb-2 font-headline text-xl font-bold text-on-surface">
                {group.category}
              </h2>
              <div className="space-y-2">
                {group.questions.map((item) => (
                  <AccordionItem
                    key={`${group.category}-${item.q}`}
                    value={`${group.category}-${item.q}`}
                    question={item.q}
                  >
                    {item.a}
                  </AccordionItem>
                ))}
              </div>
            </section>
          ))}
        </Accordion>

        <section className="space-y-3 rounded-2xl bg-secondary-container p-8 text-center">
          <span className="material-symbols-outlined block text-on-secondary-container" style={{ fontSize: "36px" }}>
            chat
          </span>
          <h2 className="font-headline text-xl font-bold text-on-secondary-container">Nu ai găsit răspunsul?</h2>
          <p className="text-sm text-on-secondary-container/80">
            Echipa noastră de suport răspunde în 2 zile lucrătoare.
          </p>
          <a
            href="mailto:suport@my-olx.ro"
            className="inline-flex items-center justify-center rounded-control bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary no-underline transition-opacity hover:opacity-90"
          >
            Trimite un email
          </a>
        </section>
      </div>
    </main>
  );
}
