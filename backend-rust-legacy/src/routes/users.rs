use crate::{handlers::users, state::AppState};
use axum::{
    routing::{get, patch, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/me", get(users::me).patch(users::update_profile))
        .route("/me/stats", get(users::get_stats))
        .route("/me/password", patch(users::change_password))
        .route("/me/avatar/upload-url", post(users::get_avatar_upload_url))
        .route("/:id", get(users::get_public_profile))
        .route("/:id/listings", get(users::get_user_listings))
}
