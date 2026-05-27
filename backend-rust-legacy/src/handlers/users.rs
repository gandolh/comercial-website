use crate::{
    dto::{
        auth::UserSummary,
        image::{UploadUrlRequest, UploadUrlResponse},
        listing::{ListingFilters, ListingsPageResponse},
        user::{ChangePasswordRequest, MyStatsResponse, PublicUserResponse, UpdateProfileRequest},
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        email_tokens::PgEmailTokenRepository, listings::PgListingRepository,
        password_tokens::PgPasswordTokenRepository, phone_tokens::PgPhoneTokenRepository,
        users::PgUserRepository,
    },
    services::{auth::AuthService, listings::ListingService, users::UserService},
    state::AppState,
};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

fn user_service(state: &AppState) -> UserService<PgUserRepository> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    UserService::new(repo, state.s3.clone(), state.config.clone())
}

pub async fn me(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<UserSummary>, AppError> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    let user_summary = svc.get_user_summary(user_id).await?;
    Ok(Json(user_summary))
}

pub async fn update_profile(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<UpdateProfileRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let svc = user_service(&state);
    svc.update_profile(user_id, body).await?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn change_password(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let svc = user_service(&state);
    svc.change_password(user_id, body).await?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn get_avatar_upload_url(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<UploadUrlRequest>,
) -> Result<Json<UploadUrlResponse>, AppError> {
    let svc = user_service(&state);
    let res = svc.request_avatar_upload_url(user_id, body).await?;
    Ok(Json(res))
}

pub async fn get_public_profile(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<PublicUserResponse>, AppError> {
    let svc = user_service(&state);
    let profile = svc.get_public_profile(id).await?;
    Ok(Json(profile))
}

pub async fn get_user_listings(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Query(mut filters): Query<ListingFilters>,
) -> Result<Json<ListingsPageResponse>, AppError> {
    filters.user_id = Some(id);
    filters.active = Some(true);

    let repo = Arc::new(PgListingRepository {
        pool: state.db.clone(),
    });
    let user_repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let svc = ListingService::new(repo, user_repo, state.config.clone());

    let listings = svc.search(&filters).await?;
    Ok(Json(listings))
}

pub async fn get_stats(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<MyStatsResponse>, AppError> {
    let svc = user_service(&state);
    let stats = svc.get_stats(user_id).await?;
    Ok(Json(stats))
}
