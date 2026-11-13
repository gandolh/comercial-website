import { useState } from "react";
import { useNavigate } from "@core/lib/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/components/ui";
import type { ListingDraft } from "../services/drafts";
import { createDraft, updateDraft, publishDraft } from "../services/drafts";
import { CategoryStep } from "../steps/CategoryStep";
import { DetailsStep } from "../steps/DetailsStep";
import { AssetUploadStep } from "../steps/AssetUploadStep";
import { PhotosStep } from "../steps/PhotosStep";
import { PriceStep } from "../steps/PriceStep";
import { ReviewStep } from "../steps/ReviewStep";
import type { DetailsStepInput, PriceStepInput } from "../schemas";

type Step = "category" | "details" | "assets" | "photos" | "price" | "review";

/** The step a draft's completeness puts the wizard on, or null to stay where it is (a draft still loading). */
function stepFor(draftId: string | null, draft: ListingDraft | undefined): Step | null {
  if (draftId && draft) {
    if (!draft.title || !draft.description) return "details";
    if (draft.assets.length === 0) return "assets";
    if (draft.priceRon === null) return "price";
    return "review";
  }
  return draftId ? null : "category";
}

interface CreateListingWizardProps {
  draftId: string | null;
  draft?: ListingDraft;
  isDraftLoading: boolean;
  draftError: Error | null;
}

export function CreateListingWizard({ draftId, draft, isDraftLoading, draftError }: CreateListingWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(() => stepFor(draftId, draft) ?? "category");

  // Determine current step based on draft data completeness, whenever the draft changes: adjust during
  // render, not in an effect.
  const [seen, setSeen] = useState({ draftId, draft });
  if (seen.draftId !== draftId || seen.draft !== draft) {
    setSeen({ draftId, draft });
    const next = stepFor(draftId, draft);
    if (next) setStep(next);
  }

  const createMutation = useMutation({
    mutationFn: createDraft,
    onSuccess: (newDraft) => {
      navigate(`/adauga-anunt/${newDraft.id}`, { replace: true });
      setStep("details");
    },
    onError: () => toast.error("Nu am putut crea schița. Încearcă din nou."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateDraft(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listing", draftId] });
    },
    onError: () => toast.error("Nu am putut salva modificările."),
  });

  const publishMutation = useMutation({
    mutationFn: publishDraft,
    onSuccess: (finalListing: ListingDraft) => {
      toast.success("Anunțul tău a fost publicat!");
      navigate(`/anunturi/${finalListing.id}`);
    },
    onError: (error: Error) => {
      if (error instanceof Error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          toast.error("Ai atins limita de 5 anunțuri pe săptămână.");
        } else {
          toast.error("Nu am putut publica anunțul. Verifică toate câmpurile.");
        }
      }
    },
  });

  const handleCategorySelect = (category: string) => {
    if (draftId) {
      updateMutation.mutate({ id: draftId, payload: { category } });
      setStep("details");
    } else {
      createMutation.mutate(category);
    }
  };

  const handleDetailsNext = (data: DetailsStepInput) => {
    if (!draftId) return;
    updateMutation.mutate({
      id: draftId,
      payload: {
        title: data.title,
        description: data.description,
      },
    });
    setStep("assets");
  };

  const handleAssetsNext = () => setStep("photos");

  const handlePhotosNext = () => setStep("price");

  const handlePriceNext = (data: PriceStepInput) => {
    if (!draftId) return;
    updateMutation.mutate({
      id: draftId,
      payload: {
        price_ron: data.isFree ? 0 : data.priceRon,
      },
    });
    setStep("review");
  };

  const handlePublish = () => {
    if (!draftId) return;
    publishMutation.mutate(draftId);
  };

  if (isDraftLoading) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-primary motion-safe:animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (draftError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Ups! Ceva n-a mers bine.</h2>
        <button onClick={() => navigate("/adauga-anunt")} className="font-bold text-primary hover:underline">
          Începe de la capăt
        </button>
      </div>
    );
  }

  return (
    <main className="mt-8 pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Progress indicator */}
        <div className="mb-12 flex items-center justify-between gap-4 overflow-x-auto px-4">
          {[
            { id: "category", label: "Categorie" },
            { id: "details", label: "Detalii" },
            { id: "assets", label: "Fișiere" },
            { id: "photos", label: "Imagini" },
            { id: "price", label: "Preț" },
            { id: "review", label: "Final" },
          ].map((s, idx) => {
            const steps = ["category", "details", "assets", "photos", "price", "review"];
            const currentIdx = steps.indexOf(step);
            const isCompleted = idx < currentIdx;
            const isActive = s.id === step;

            return (
              <div key={s.id} className="flex shrink-0 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : isCompleted
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-high text-outline"
                  }`}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-sm">check</span> : idx + 1}
                </div>
                <span className={`text-sm font-bold ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {s.label}
                </span>
                {idx < 5 && <div className="ml-2 h-[2px] w-4 bg-surface-container-highest md:w-8" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mx-auto max-w-2xl">
          {step === "category" && <CategoryStep selectedCategory={draft?.category} onSelect={handleCategorySelect} />}
          {step === "details" && (
            <DetailsStep
              initialData={{
                title: draft?.title,
                description: draft?.description,
              }}
              onNext={handleDetailsNext}
              onBack={() => setStep("category")}
            />
          )}
          {step === "assets" && draftId && (
            <AssetUploadStep
              listingId={draftId}
              assets={draft?.assets || []}
              onAssetsChange={() =>
                queryClient.invalidateQueries({
                  queryKey: ["listing", draftId],
                })
              }
              onNext={handleAssetsNext}
              onBack={() => setStep("details")}
            />
          )}
          {step === "photos" && draftId && (
            <PhotosStep
              listingId={draftId}
              images={draft?.images || []}
              onImagesChange={() =>
                queryClient.invalidateQueries({
                  queryKey: ["listing", draftId],
                })
              }
              onNext={handlePhotosNext}
              onBack={() => setStep("assets")}
            />
          )}
          {step === "price" && (
            <PriceStep
              initialData={{
                priceRon: draft?.priceRon,
                isFree: draft?.priceRon === 0,
              }}
              onNext={handlePriceNext}
              onBack={() => setStep("photos")}
            />
          )}
          {step === "review" && draft && (
            <ReviewStep
              draft={draft}
              onPublish={handlePublish}
              onBack={() => setStep("price")}
              isPublishing={publishMutation.isPending}
            />
          )}
        </div>
      </div>
    </main>
  );
}
