use axum::{
    routing::{delete, patch, post},
    Router,
};

use crate::{handlers::images, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/upload-url", post(images::request_upload_url))
        .route("/", post(images::commit_image))
        .route("/reorder", patch(images::reorder_images))
        .route("/:image_id", delete(images::delete_image))
}
