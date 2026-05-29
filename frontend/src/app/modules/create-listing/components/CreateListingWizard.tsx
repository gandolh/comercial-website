import { useState, useEffect } from "react";
import { useNavigate } from "@core/lib/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

interface CreateListingWizardProps {
  draftId: string | null;
  draft?: ListingDraft;
  isDraftLoading: boolean;
  draftError: Error | null;
}

export function CreateListingWizard({
  draftId,
  draft,
  isDraftLoading,
  draftError,
}: CreateListingWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("category");

  // Determine current step based on draft data completeness
  useEffect(() => {
    if (draftId && draft) {
      if (!draft.title || !draft.description) {
        setStep("details");
      } else if (draft.assets.length === 0) {
        setStep("assets");
      } else if (draft.priceRon === null) {
        setStep("price");
      } else {
        setStep("review");
      }
    } else if (!draftId) {
      setStep("category");
    }
  }, [draftId, draft]);

  const createMutation = useMutation({
    mutationFn: createDraft,
    onSuccess: (newDraft) => {
      navigate(`/adauga-anunt/${newDraft.id}`, { replace: true });
      setStep("details");
    },
    onError: () => toast.error("Nu am putut crea schița. Încearcă din nou."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => updateDraft(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", draftId] });
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
      <div className="max-w-2xl mx-auto py-24 text-center">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (draftError) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ups! Ceva n-a mers bine.</h2>
        <button
          onClick={() => navigate("/adauga-anunt")}
          className="text-primary font-bold hover:underline"
        >
          Începe de la capăt
        </button>
      </div>
    );
  }

  return (
    <main className="mt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress indicator */}
        <div className="mb-12 flex justify-between items-center px-4 overflow-x-auto gap-4">
          {[
            { id: "category", label: "Categorie" },
            { id: "details", label: "Detalii" },
            { id: "assets", label: "Fișiere" },
            { id: "photos", label: "Imagini" },
            { id: "price", label: "Preț" },
            { id: "review", label: "Final" },
          ].map((s, idx) => {
            const steps = [
              "category",
              "details",
              "assets",
              "photos",
              "price",
              "review",
            ];
            const currentIdx = steps.indexOf(step);
            const isCompleted = idx < currentIdx;
            const isActive = s.id === step;

            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : isCompleted
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-high text-outline"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-sm font-bold ${
                    isActive ? "text-on-surface" : "text-on-surface-variant"
                  }`}
                >
                  {s.label}
                </span>
                {idx < 5 && (
                  <div className="w-4 md:w-8 h-[2px] bg-surface-container-highest ml-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {step === "category" && (
            <CategoryStep
              selectedCategory={draft?.category}
              onSelect={handleCategorySelect}
            />
          )}
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
