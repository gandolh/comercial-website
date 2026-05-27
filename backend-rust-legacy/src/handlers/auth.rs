use crate::{
    dto::auth::{
        AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, RequestPhoneCodeRequest,
        ResetPasswordRequest, VerifyEmailRequest, VerifyPhoneRequest,
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        email_tokens::PgEmailTokenRepository,
        password_tokens::PgPasswordTokenRepository,
        phone_tokens::PgPhoneTokenRepository,
        users::PgUserRepository,
    },
    services::auth::AuthService,
    state::AppState,
};
use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;
use validator::Validate;

/// Register a new user
#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "User registered successfully", body = AuthResponse),
        (status = 400, description = "Invalid input or email already exists")
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    let resp = svc.register(&body.email, &body.password).await?;
    Ok(Json(resp))
}

/// Login with email and password
#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = AuthResponse),
        (status = 401, description = "Invalid credentials")
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    let resp = svc.login(&body.email, &body.password).await?;
    Ok(Json(resp))
}

pub async fn logout() -> Result<StatusCode, AppError> {
    Ok(StatusCode::NO_CONTENT)
}

pub async fn verify_email(
    State(state): State<AppState>,
    Json(body): Json<VerifyEmailRequest>,
) -> Result<StatusCode, AppError> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.verify_email(&body.token).await?;
    Ok(StatusCode::OK)
}

pub async fn resend_verification(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<StatusCode, AppError> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.resend_verification(user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn forgot_password(
    State(state): State<AppState>,
    Json(body): Json<ForgotPasswordRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.forgot_password(&body.email).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn reset_password(
    State(state): State<AppState>,
    Json(body): Json<ResetPasswordRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.reset_password(&body.token, &body.password).await?;
    Ok(StatusCode::OK)
}

pub async fn request_phone_code(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<RequestPhoneCodeRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.request_phone_code(user_id, &body.phone).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn verify_phone(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<VerifyPhoneRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    svc.verify_phone(user_id, &body.code).await?;
    Ok(StatusCode::OK)
}
