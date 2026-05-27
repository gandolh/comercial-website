use crate::{handlers::auth, state::AppState};
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/register", post(auth::register))
        .route("/login", post(auth::login))
        .route("/logout", post(auth::logout))
        .route("/email/verify", post(auth::verify_email))
        .route("/email/resend", post(auth::resend_verification))
        .route("/password/forgot", post(auth::forgot_password))
        .route("/password/reset", post(auth::reset_password))
        .route("/phone/request-code", post(auth::request_phone_code))
        .route("/phone/verify", post(auth::verify_phone))
}
