export interface ListingCard {
  id: string
  title: string
  priceRon: number | null
  city: string
  category: string
  coverUrl: string | null
  sellerVerified: boolean
  postedAt: string
  active: boolean
  expiresAt: string
}

export interface ListingsPage {
  listings: ListingCard[]
  totalCount: number
  totalPages: number
  page: number
}

export interface ListingImage {
  id: string
  url: string
  position: number
}

export interface ListingAsset {
  id: string
  originalFilename: string
  fileSizeBytes: number
  contentType: string
  position: number
  // Present when freshly uploaded via the create-listing wizard.
  s3Key?: string
  publicUrl?: string
}

export interface ListingSeller {
  id: string
  displayName: string | null
  avatarUrl: string | null
  phoneVerified: boolean
  memberSince: string
  activeListingsCount: number
}

export interface ListingDetail {
  id: string
  title: string
  description: string
  priceRon: number | null
  isNegotiable: boolean
  category: string
  categoryLabel: string
  city: string
  images: ListingImage[]
  assets: ListingAsset[]
  viewCount: number
  postedAt: string
  expiresAt: string
  active: boolean
  seller: ListingSeller
  licenseType?: 'personal' | 'commercial' | 'extended'
  fileFormat?: string
  fileSizeBytes?: number
  downloadCount?: number
  /** Average rating (null if no reviews). */
  ratingAvg?: number | null
  /** Total review count. */
  ratingCount?: number
}
