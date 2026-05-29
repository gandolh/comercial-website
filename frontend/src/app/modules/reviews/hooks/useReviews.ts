import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "../services/reviews.service";
import type { SubmitReviewRequest } from "../services/reviews.service";

export function useReviews(listingId: string) {
  return useQuery({
    queryKey: ["reviews", listingId],
    queryFn: () => reviewsService.getReviews(listingId),
    enabled: !!listingId,
  });
}

export function useSubmitReview(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewRequest) =>
      reviewsService.submitReview(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
    },
  });
}

export function useDeleteReview(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reviewsService.deleteReview(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
    },
  });
}
