import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDraft } from "../services/drafts";
import type { ListingDraft } from "../services/drafts";

interface Options {
  onSuccess?: (draft: ListingDraft, category: string) => void;
}

export function useCreateDraftMutation(options?: Options) {
  return useMutation({
    mutationFn: (category: string) => createDraft(category),
    onSuccess: (draft, category) => {
      toast.success("Draft creat. Continuă să completezi detaliile.");
      options?.onSuccess?.(draft, category);
    },
    onError: () => {
      toast.error("Nu am putut crea draftul. Încearcă din nou.");
    },
  });
}
