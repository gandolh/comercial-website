use crate::{handlers::favorites, state::AppState};
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new().route(
        "/:listing_id",
        post(favorites::add_favorite).delete(favorites::remove_favorite),
    )
}
