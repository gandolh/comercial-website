use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    dto::image::{
        CommitImageRequest, ImageResponse, ReorderRequest, UploadUrlRequest, UploadUrlResponse,
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::images::PgImageRepository,
    services::images::ImageService,
    state::AppState,
};

fn image_service(state: &AppState) -> ImageService<PgImageRepository> {
    let repo = Arc::new(PgImageRepository {
        pool: state.db.clone(),
    });

    ImageService::new(repo, state.s3.clone(), state.config.clone())
}

pub async fn request_upload_url(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
    Json(body): Json<UploadUrlRequest>,
) -> Result<Json<UploadUrlResponse>, AppError> {
    let svc = image_service(&state);
    let response = svc.request_upload_url(listing_id, user_id, body).await?;

    Ok(Json(response))
}

pub async fn commit_image(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
    Json(body): Json<CommitImageRequest>,
) -> Result<Json<ImageResponse>, AppError> {
    let svc = image_service(&state);
    let image = svc.commit_image(listing_id, user_id, body).await?;

    Ok(Json(image))
}

pub async fn reorder_images(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
    Json(body): Json<ReorderRequest>,
) -> Result<Json<Vec<ImageResponse>>, AppError> {
    let svc = image_service(&state);
    let images = svc.reorder_images(listing_id, user_id, body).await?;

    Ok(Json(images))
}

pub async fn delete_image(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path((listing_id, image_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    let svc = image_service(&state);
    svc.delete_image(listing_id, image_id, user_id).await?;

    Ok(Json(serde_json::json!({ "deleted": true })))
}
