use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;
use once_cell::sync::Lazy;
use regex::Regex;

pub static PHONE_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^(\+40|0)7\d{8}$").unwrap()
});

pub fn validate_phone(phone: &str) -> Result<(), validator::ValidationError> {
    if PHONE_RE.is_match(phone) {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_phone"))
    }
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct RegisterRequest {
    #[validate(email(message = "invalid email"))]
    pub email: String,
    #[validate(length(min = 8, message = "password must be at least 8 characters"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct RequestPhoneCodeRequest {
    #[validate(custom(function = "validate_phone"))]
    pub phone: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct VerifyPhoneRequest {
    #[validate(length(equal = 6, message = "code must be 6 digits"))]
    pub code: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[validate(email(message = "invalid email"))]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserSummary,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct UserSummary {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub email_verified: bool,
    pub phone: Option<String>,
    pub phone_verified: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ForgotPasswordRequest {
    #[validate(email(message = "invalid email"))]
    pub email: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ResetPasswordRequest {
    pub token: String,
    #[validate(length(min = 8, message = "password must be at least 8 characters"))]
    pub password: String,
}
