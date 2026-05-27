use crate::{
    dto::listing::{
        CreateListingRequest, ListingCardResponse, ListingDetailResponse, ListingFilters,
        ListingResponse, ListingsPageResponse, SellerPhoneResponse, UpdateListingRequest,
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{listings::PgListingRepository, users::PgUserRepository},
    services::listings::ListingService,
    state::AppState,
};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Default, Deserialize)]
pub struct MyListingsQuery {
    pub active: Option<bool>,
}

fn listing_service(state: &AppState) -> ListingService<PgListingRepository, PgUserRepository> {
    let repo = Arc::new(PgListingRepository {
        pool: state.db.clone(),
    });
    let user_repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    ListingService::new(repo, user_repo, state.config.clone())
}

/// List public listings with filters
#[utoipa::path(
    get,
    path = "/listings",
    params(
        ListingFilters
    ),
    responses(
        (status = 200, description = "List of listings", body = ListingsPageResponse)
    )
)]
pub async fn list_public(
    State(state): State<AppState>,
    Query(filters): Query<ListingFilters>,
) -> Result<Json<ListingsPageResponse>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.search(&filters).await?;
    Ok(Json(listings))
}

pub async fn list_featured(
    State(state): State<AppState>,
) -> Result<Json<Vec<ListingCardResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.featured(8).await?;
    Ok(Json(listings))
}

/// Get listing details
#[utoipa::path(
    get,
    path = "/listings/{id}",
    params(
        ("id" = Uuid, Path, description = "Listing ID")
    ),
    responses(
        (status = 200, description = "Listing details", body = ListingDetailResponse),
        (status = 404, description = "Listing not found")
    )
)]
pub async fn get_listing(
    State(state): State<AppState>,
    auth_user: Option<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingDetailResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc
        .get_detail(id, auth_user.map(|AuthUser(user_id)| user_id))
        .await?;
    Ok(Json(listing))
}

pub async fn get_related(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ListingCardResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.get_related(id).await?;
    Ok(Json(listings))
}

/// Create a new listing
#[utoipa::path(
    post,
    path = "/listings",
    request_body = CreateListingRequest,
    responses(
        (status = 200, description = "Listing created", body = ListingResponse),
        (status = 401, description = "Unauthorized"),
        (status = 400, description = "Invalid input")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn create_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<CreateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    if body.active.unwrap_or(true) {
        body.validate()
            .map_err(|e| AppError::Validation(e.to_string()))?;
    }
    let svc = listing_service(&state);
    let listing = svc.create(user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn list_my_listings(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Query(query): Query<MyListingsQuery>,
) -> Result<Json<Vec<ListingResponse>>, AppError> {
    let svc = listing_service(&state);
    let listings = svc.list_by_user(user_id, query.active).await?;
    Ok(Json(listings))
}

pub async fn update_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateListingRequest>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.update(id, user_id, &body).await?;
    Ok(Json(listing))
}

pub async fn renew_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.renew(id, user_id).await?;
    Ok(Json(listing))
}

pub async fn deactivate_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.set_active(id, user_id, false).await?;
    Ok(Json(listing))
}

pub async fn activate_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.set_active(id, user_id, true).await?;
    Ok(Json(listing))
}

pub async fn publish_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ListingResponse>, AppError> {
    let svc = listing_service(&state);
    let listing = svc.publish(id, user_id).await?;
    Ok(Json(listing))
}

#[derive(Debug, Default, Deserialize)]
pub struct SuggestQuery {
    pub q: Option<String>,
    pub limit: Option<i64>,
}

pub async fn suggest_titles(
    State(state): State<AppState>,
    Query(params): Query<SuggestQuery>,
) -> Result<Json<Vec<String>>, AppError> {
    let q = params.q.unwrap_or_default();
    let limit = params.limit.unwrap_or(20).min(20);
    let svc = listing_service(&state);
    let suggestions = svc.suggest_titles(&q, limit).await?;
    Ok(Json(suggestions))
}

pub async fn delete_listing(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let svc = listing_service(&state);
    svc.delete(id, user_id).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}

pub async fn get_seller_phone(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<SellerPhoneResponse>, AppError> {
    let svc = listing_service(&state);
    let phone = svc.get_seller_phone(id, user_id).await?;
    Ok(Json(SellerPhoneResponse { phone }))
}
