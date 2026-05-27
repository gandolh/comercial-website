use axum::{routing::get, Router};
use crate::{handlers::locations, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/counties", get(locations::get_counties))
        .route("/cities", get(locations::search_cities))
}
