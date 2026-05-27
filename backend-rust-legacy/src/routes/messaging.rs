use axum::{
    routing::{get, post},
    Router,
};
use crate::{handlers::messaging, state::AppState};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(messaging::list_conversations))
        .route("/:id", get(messaging::get_conversation))
        .route("/:id/messages", get(messaging::list_messages).post(messaging::post_message))
        .route("/:id/read", post(messaging::mark_as_read))
}
