use crate::{handlers::listings, routes::images, state::AppState};
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/",
            get(listings::list_public).post(listings::create_listing),
        )
        .route("/featured", get(listings::list_featured))
        .route("/suggest", get(listings::suggest_titles))
        .route(
            "/:id",
            get(listings::get_listing)
                .patch(listings::update_listing)
                .delete(listings::delete_listing),
        )
        .route("/:id/publish", post(listings::publish_listing))
        .route("/:id/renew", post(listings::renew_listing))
        .route("/:id/deactivate", post(listings::deactivate_listing))
        .route("/:id/activate", post(listings::activate_listing))
        .route("/:id/related", get(listings::get_related))
        .route("/:id/seller-phone", get(listings::get_seller_phone))
        .route("/:id/conversations", post(crate::handlers::messaging::start_conversation))
        .nest("/:id/images", images::router())
}
