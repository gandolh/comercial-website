use crate::{
    dto::listing::{FavoritesIdsResponse, ListingFilters, ListingsPageResponse},
    error::AppError,
    middleware::auth::AuthUser,
    repositories::favorites::PgFavoriteRepository,
    services::favorites::FavoriteService,
    state::AppState,
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

fn favorite_service(state: &AppState) -> FavoriteService<PgFavoriteRepository> {
    let repo = Arc::new(PgFavoriteRepository {
        pool: state.db.clone(),
    });
    FavoriteService::new(repo, state.config.clone())
}

pub async fn add_favorite(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let svc = favorite_service(&state);
    svc.add(user_id, listing_id).await?;
    Ok(StatusCode::CREATED)
}

pub async fn remove_favorite(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let svc = favorite_service(&state);
    svc.remove(user_id, listing_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn list_favorites(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Query(filters): Query<ListingFilters>,
) -> Result<Json<ListingsPageResponse>, AppError> {
    let svc = favorite_service(&state);
    let page = svc.list(user_id, &filters).await?;
    Ok(Json(page))
}

pub async fn list_favorite_ids(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<FavoritesIdsResponse>, AppError> {
    let svc = favorite_service(&state);
    let ids = svc.list_ids(user_id).await?;
    Ok(Json(ids))
}
