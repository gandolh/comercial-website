import { axiosInstance } from "@core/lib/axios";
import type { Review, ReviewsResponse } from "../types/index";

export interface SubmitReviewRequest {
  rating: number;
  body?: string | null;
}

export const reviewsService = {
  /**
   * Fetch all reviews + aggregate for a listing.
   */
  async getReviews(listingId: string): Promise<ReviewsResponse> {
    const res = await axiosInstance.get<ReviewsResponse>(
      `/listings/${listingId}/reviews`
    );
    return res.data;
  },

  /**
   * Create or update the authenticated buyer's review for a listing.
   */
  async submitReview(
    listingId: string,
    payload: SubmitReviewRequest
  ): Promise<Review> {
    const res = await axiosInstance.post<Review>(
      `/listings/${listingId}/reviews`,
      payload
    );
    return res.data;
  },

  /**
   * Delete the authenticated buyer's review for a listing.
   */
  async deleteReview(listingId: string): Promise<void> {
    await axiosInstance.delete(`/listings/${listingId}/reviews/mine`);
  },
};
