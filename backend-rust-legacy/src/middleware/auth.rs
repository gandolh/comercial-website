use crate::{error::AppError, state::AppState};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Debug, Clone)]
pub struct AuthUser(pub Uuid);

pub(crate) fn decode_token(token: &str, secret: &str) -> Result<Uuid, AppError> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized)?;
    Uuid::parse_str(&data.claims.sub).map_err(|_| AppError::Unauthorized)
}

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "))
            .ok_or(AppError::Unauthorized)?;
        let user_id = decode_token(auth_header, &state.config.jwt_secret)?;
        Ok(AuthUser(user_id))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decode_valid_token_returns_user_id() {
        let user_id = Uuid::new_v4();
        let secret = "test-secret";
        let exp = (chrono::Utc::now().timestamp() as u64 + 3600) as usize;
        let claims = Claims {
            sub: user_id.to_string(),
            exp,
        };
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap();
        let result = decode_token(&token, secret);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), user_id);
    }

    #[test]
    fn decode_invalid_token_returns_unauthorized() {
        let result = decode_token("not.a.token", "secret");
        assert!(matches!(result, Err(AppError::Unauthorized)));
    }
}
