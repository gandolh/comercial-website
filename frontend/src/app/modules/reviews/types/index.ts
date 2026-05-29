export interface Review {
  id: string;
  listing_id: string;
  buyer_user_id: string;
  buyer_display_name: string | null;
  rating: number;
  body: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  rating_avg: number | null;
  rating_count: number;
}
