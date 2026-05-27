use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate, Clone, ToSchema)]
pub struct CreateListingRequest {
    #[validate(length(min = 5, max = 200, message = "title must be 5-200 characters"))]
    pub title: String,
    #[validate(length(min = 10, message = "description must be at least 10 characters"))]
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    #[validate(length(min = 1, message = "category is required"))]
    pub category: String,
    #[validate(length(min = 1, message = "city is required"))]
    pub city: String,
    pub active: Option<bool>,
}

#[derive(Debug, Default, Deserialize, Validate, Clone, ToSchema)]
pub struct UpdateListingRequest {
    #[validate(length(min = 5, max = 200, message = "title must be 5-200 characters"))]
    pub title: Option<String>,
    #[validate(length(
        min = 10,
        max = 5000,
        message = "description must be 10-5000 characters"
    ))]
    pub description: Option<String>,
    pub price_ron: Option<Option<i64>>,
    pub is_negotiable: Option<bool>,
    #[validate(length(min = 1, message = "category is required"))]
    pub category: Option<String>,
    #[validate(length(min = 1, message = "city is required"))]
    pub city: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize, Default, Clone, ToSchema, IntoParams)]
pub struct ListingFilters {
    pub q: Option<String>,
    pub category: Option<String>,
    pub city: Option<String>,
    pub price_min: Option<i64>,
    pub price_max: Option<i64>,
    pub date: Option<String>,
    pub verified: Option<bool>,
    pub sort: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub user_id: Option<Uuid>,
    pub active: Option<bool>,
}

impl ListingFilters {
    pub fn page(&self) -> i64 {
        self.page.unwrap_or(1).max(1)
    }

    pub fn per_page(&self) -> i64 {
        self.per_page.unwrap_or(12).clamp(1, 50)
    }

    pub fn offset(&self) -> i64 {
        (self.page() - 1) * self.per_page()
    }

    pub fn verified_only(&self) -> bool {
        self.verified.unwrap_or(false)
    }

    pub fn normalized_query(&self) -> String {
        self.q.clone().unwrap_or_default().trim().to_string()
    }

    pub fn normalized_sort(&self) -> String {
        self.sort.clone().unwrap_or_else(|| "noi".into())
    }
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ListingResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    pub category: String,
    pub city: String,
    pub active: bool,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct ListingCardResponse {
    pub id: Uuid,
    pub title: String,
    pub price_ron: Option<i64>,
    pub city: String,
    pub category: String,
    pub cover_url: Option<String>,
    pub seller_verified: bool,
    pub posted_at: DateTime<Utc>,
    pub active: bool,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct ListingsPageResponse {
    pub listings: Vec<ListingCardResponse>,
    pub total_count: i64,
    pub total_pages: i64,
    pub page: i64,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct FavoritesIdsResponse {
    pub ids: Vec<Uuid>,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct ListingImageResponse {
    pub id: Uuid,
    pub url: String,
    pub position: i32,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct SellerSummary {
    pub id: Uuid,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub phone_verified: bool,
    pub member_since: DateTime<Utc>,
    pub active_listings_count: i64,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct ListingDetailResponse {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    pub category: String,
    pub category_label: String,
    pub city: String,
    pub images: Vec<ListingImageResponse>,
    pub view_count: i64,
    pub posted_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub active: bool,
    pub seller: SellerSummary,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct SellerPhoneResponse {
    pub phone: String,
}
