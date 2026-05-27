import { ListingCard } from "@app/modules/home/components/ListingCard";
import type { ListingCard as ListingCardItem } from "@app/types/listing";

interface RelatedListingsProps {
  listings: ListingCardItem[];
}

export function RelatedListings({ listings }: RelatedListingsProps) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-24">
      <h2
        className="text-3xl font-black mb-10 text-on-surface"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Anunțuri Similare
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
