use utoipa::OpenApi;
use crate::dto;
use crate::handlers;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::auth::register,
        handlers::auth::login,
        handlers::listings::list_public,
        handlers::listings::get_listing,
        handlers::listings::create_listing,
    ),
    components(
        schemas(
            dto::auth::RegisterRequest,
            dto::auth::LoginRequest,
            dto::auth::AuthResponse,
            dto::auth::UserSummary,
            dto::listing::CreateListingRequest,
            dto::listing::ListingResponse,
            dto::listing::ListingDetailResponse,
            dto::listing::ListingCardResponse,
            dto::listing::ListingsPageResponse,
            dto::listing::ListingFilters,
            dto::listing::SellerSummary,
            dto::listing::ListingImageResponse,
        )
    ),
    tags(
        (name = "auth", description = "Authentication endpoints"),
        (name = "listings", description = "Listing management endpoints")
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;

struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "jwt",
                utoipa::openapi::security::SecurityScheme::Http(
                    utoipa::openapi::security::HttpBuilder::new()
                        .scheme(utoipa::openapi::security::HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
        }
    }
}
