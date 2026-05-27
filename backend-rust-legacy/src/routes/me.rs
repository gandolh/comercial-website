use crate::{
    handlers::{favorites, listings},
    state::AppState,
};
use axum::{routing::get, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/listings", get(listings::list_my_listings))
        .route("/favorites", get(favorites::list_favorites))
        .route("/favorites/ids", get(favorites::list_favorite_ids))
}
