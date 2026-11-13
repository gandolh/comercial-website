import { ListingCard } from "@app/modules/home/components/ListingCard";
import type { ListingCard as ListingCardItem } from "@app/types/listing";

interface RelatedListingsProps {
  listings: ListingCardItem[];
}

export function RelatedListings({ listings }: RelatedListingsProps) {
  if (listings.length === 0) return null;

  return (
    <section className="pt-10">
      <h2 className="mb-4 text-price font-extrabold text-on-surface">Anunțuri Similare</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 md:gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
