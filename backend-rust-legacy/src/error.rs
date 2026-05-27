use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("not found")]
    NotFound,
    #[error("unauthorized")]
    Unauthorized,
    #[error("forbidden")]
    Forbidden,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("conflict: {0}")]
    Conflict(String),
    #[error("rate limit exceeded")]
    RateLimit,
    #[error("internal error")]
    Internal(#[from] anyhow::Error),
    #[error("database error")]
    Database(#[from] sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, self.to_string()),
            AppError::Validation(m) => (StatusCode::UNPROCESSABLE_ENTITY, m.clone()),
            AppError::Conflict(m) => (StatusCode::CONFLICT, m.clone()),
            AppError::RateLimit => (StatusCode::TOO_MANY_REQUESTS, self.to_string()),
            AppError::Internal(e) => {
                tracing::error!("internal error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "internal error".into())
            }
            AppError::Database(e) => {
                tracing::error!("database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "internal error".into())
            }
        };
        let body = Json(serde_json::json!({ "error": message }));
        (status, body).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn not_found_displays_correctly() {
        let err = AppError::NotFound;
        assert_eq!(err.to_string(), "not found");
    }

    #[test]
    fn validation_error_includes_message() {
        let err = AppError::Validation("email is required".into());
        assert_eq!(err.to_string(), "validation error: email is required");
    }

    #[test]
    fn conflict_error_includes_message() {
        let err = AppError::Conflict("email already taken".into());
        assert_eq!(err.to_string(), "conflict: email already taken");
    }
}
