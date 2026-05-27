use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, ToSchema)]
pub struct UploadUrlRequest {
    pub content_type: String,
    pub filename: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct UploadUrlResponse {
    pub upload_url: String,
    pub s3_key: String,
    pub public_url: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CommitImageRequest {
    pub s3_key: String,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub bytes: Option<i64>,
}

#[derive(Debug, Serialize, Clone, ToSchema)]
pub struct ImageResponse {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub url: String,
    pub position: i32,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct ReorderRequest {
    pub order: Vec<Uuid>,
}
