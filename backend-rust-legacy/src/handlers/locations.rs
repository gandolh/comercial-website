use axum::{extract::{Query, State}, response::Json};
use serde::{Deserialize, Serialize};

use crate::{
    error::AppError,
    models::location::County,
    repositories::locations::PgLocationRepository,
    services::locations::LocationService,
    state::AppState,
};

#[derive(Serialize)]
pub struct CitySearchResponse {
    pub items: Vec<String>,
    pub total: i64,
    pub page: usize,
    pub limit: usize,
}

#[derive(Deserialize)]
pub struct CitySearchParams {
    #[serde(default)]
    pub q: String,
    #[serde(default = "default_page")]
    pub page: usize,
    #[serde(default = "default_limit")]
    pub limit: usize,
}

fn default_page() -> usize { 1 }
fn default_limit() -> usize { 20 }

pub async fn get_counties(State(state): State<AppState>) -> Result<Json<Vec<County>>, AppError> {
    let svc = LocationService::new(PgLocationRepository { db: state.db });
    let counties = svc.get_counties().await?;
    Ok(Json(counties))
}

pub async fn search_cities(
    State(state): State<AppState>,
    Query(params): Query<CitySearchParams>,
) -> Result<Json<CitySearchResponse>, AppError> {
    let svc = LocationService::new(PgLocationRepository { db: state.db });
    let (cities, total) = svc.search_cities(&params.q, params.page, params.limit).await?;
    let items = cities.into_iter().map(|c| format!("{}, {}", c.county_name, c.name)).collect();
    Ok(Json(CitySearchResponse { items, total, page: params.page, limit: params.limit }))
}
