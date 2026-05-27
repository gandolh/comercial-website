import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PhoneVerifyModal from "../../auth/components/PhoneVerifyModal";
import { reviewStepSchema, type ReviewStepInput } from "../schemas";
import type { ListingDraft } from "../services/drafts";
import { ListingGallery } from "../../listings/components/ListingGallery";
import { ListingDescription } from "../../listings/components/ListingDescription";
import { PricingCard } from "../../listings/components/PricingCard";
import { SellerCard } from "../../listings/components/SellerCard";

interface ReviewStepProps {
  draft: ListingDraft;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
}

export function ReviewStep({
  draft,
  onPublish,
  onBack,
  isPublishing,
}: ReviewStepProps) {
  const { user } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewStepInput>({
    resolver: zodResolver(reviewStepSchema),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Verifică și publică
        </h2>
        <p className="text-on-surface-variant">
          Aruncă o ultimă privire înainte ca anunțul tău să devină public.
        </p>
      </div>

      {!user?.phone_verified && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="font-bold text-on-surface">
              Devino vânzător verificat
            </h4>
            <p className="text-sm text-on-surface-variant">
              Adaugă numărul de telefon verificat pentru a apărea ca vânzător
              verificat și a câștiga încrederea cumpărătorilor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPhoneModalOpen(true)}
            className="px-6 py-2 rounded-full bg-white border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors shadow-sm whitespace-nowrap"
          >
            Verifică acum
          </button>
        </div>
      )}

      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant shadow-sm">
        <div className="p-4 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ListingGallery images={draft.images} title={draft.title} />
              <ListingDescription
                id={draft.id}
                description={draft.description}
                features={[]}
              />
              {draft.assets && draft.assets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Fișierele pentru descărcare</h3>
                  <div className="space-y-3">
                    {draft.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-surface-container border border-outline-variant rounded-xl p-4 flex items-center gap-4"
                      >
                        <span className="material-symbols-outlined text-primary shrink-0">
                          file_present
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {asset.original_filename}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {Math.round(asset.file_size_bytes / 1024)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <PricingCard
                listingId={draft.id}
                sellerId={draft.seller.id}
                sellerName={draft.seller.displayName ?? ""}
                title={draft.title}
                priceRon={draft.priceRon}
                location={draft.city}
                viewCount={draft.viewCount}
              />
              <SellerCard seller={draft.seller} listingId={draft.id} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onPublish)} className="space-y-6">
        <div className="space-y-3 px-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("acceptsTerms")}
              className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low transition-colors"
            />
            <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
              Confirm că datele introduse sunt corecte și sunt de acord cu
              Termenii și Condițiile platformei.
            </span>
          </label>
          {errors.acceptsTerms && (
            <p className="text-error text-xs px-8">
              {errors.acceptsTerms.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPublishing}
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Înapoi
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="flex-[2] px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Se publică...
              </>
            ) : (
              "Publică anunțul"
            )}
          </button>
        </div>
      </form>

      <PhoneVerifyModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </div>
  );
}
