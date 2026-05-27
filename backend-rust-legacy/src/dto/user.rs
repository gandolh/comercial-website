use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct UpdateProfileRequest {
    #[validate(length(min = 2, max = 60, message = "display name must be 2–60 characters"))]
    pub display_name: Option<String>,
    pub avatar_s3_key: Option<String>,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ChangePasswordRequest {
    #[validate(length(min = 8, message = "password must be at least 8 characters"))]
    pub current_password: String,
    #[validate(length(min = 8, message = "password must be at least 8 characters"))]
    pub new_password: String,
}

#[derive(Debug, Serialize, sqlx::FromRow, ToSchema)]
pub struct PublicUserResponse {
    pub id: Uuid,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub phone_verified: bool,
    pub member_since: DateTime<Utc>,
    pub active_listings_count: i64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct MyStatsResponse {
    pub listings: ListingStats,
    pub messages: MessagingStats,
    pub favorites_count: i64,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ListingStats {
    pub active: i64,
    pub inactive: i64,
    pub expired: i64,
    pub expiring_soon: i64,
    pub weekly_post_count: i64,
    pub weekly_post_limit: i64,
    pub week_resets_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct MessagingStats {
    pub unread_count: i64,
    pub conversation_count: i64,
}
