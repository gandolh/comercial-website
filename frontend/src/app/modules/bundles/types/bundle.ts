export interface BundleChildCard {
  id: string;
  title: string;
  price_ron: number | null;
  category: string;
  cover_url: string | null;
  seller_verified: boolean;
  posted_at: string;
  active: boolean;
  expires_at: string;
}
