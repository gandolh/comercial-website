use crate::{routes, state::AppState};
use axum::{http::{HeaderValue, Method}, routing::get, Router};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};

pub fn build(state: AppState) -> Router {
    let origins: Vec<HeaderValue> = state.config
        .cors_allowed_origins
        .split(',')
        .filter_map(|s| s.trim().parse().ok())
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ACCEPT,
        ])
        .allow_credentials(false);

    Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", routes::openapi::ApiDoc::openapi()))
        .nest("/auth", routes::auth::router())
        .nest("/favorites", routes::favorites::router())
        .nest("/conversations", routes::messaging::router())
        .nest("/listings", routes::listings::router())
        .nest("/locations", routes::locations::router())
        .nest("/me", routes::me::router())
        .route("/me/unread-count", get(crate::handlers::messaging::get_unread_count))
        .nest("/users", routes::users::router())
        .layer(CompressionLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
