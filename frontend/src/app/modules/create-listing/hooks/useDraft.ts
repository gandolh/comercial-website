import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDraft } from "../services/drafts";

export function useDraft(draftId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: draftId ? ["listing", draftId] : ["listing", "new"],
    queryFn: () => {
      if (!draftId) {
        throw new Error("Draft ID missing");
      }
      return fetchDraft(draftId);
    },
    enabled: !!draftId,
    staleTime: 10_000,
  });

  return useMemo(
    () => ({
      ...query,
      remove: draftId
        ? () => queryClient.removeQueries({ queryKey: ["listing", draftId] })
        : undefined,
    }),
    [draftId, query, queryClient],
  );
}
