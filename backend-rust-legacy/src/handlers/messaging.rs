use std::sync::Arc;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::{
    dto::messaging::{
        ConversationSummary, MessageResponse, PostMessageRequest, 
        StartConversationRequest, UnreadCountResponse
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        conversations::PgConversationRepository,
        messages::PgMessageRepository,
        listings::PgListingRepository,
    },
    services::messaging::{MessagingService, MessagingServiceImpl},
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct MessagesQuery {
    pub after: Option<DateTime<Utc>>,
    pub limit: Option<i64>,
}

#[derive(Serialize)]
pub struct StartConversationResponse {
    pub conversation: ConversationSummary,
    pub message: MessageResponse,
}

fn messaging_service(state: &AppState) -> impl MessagingService {
    MessagingServiceImpl {
        conversation_repo: Arc::new(PgConversationRepository {
            pool: state.db.clone(),
        }),
        message_repo: Arc::new(PgMessageRepository {
            pool: state.db.clone(),
        }),
        listing_repo: Arc::new(PgListingRepository {
            pool: state.db.clone(),
        }),
    }
}

pub async fn start_conversation(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(listing_id): Path<Uuid>,
    Json(body): Json<StartConversationRequest>,
) -> Result<Json<StartConversationResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    
    let svc = messaging_service(&state);
    let (conversation, message) = svc.start_conversation(listing_id, user_id, body).await?;
    
    Ok(Json(StartConversationResponse {
        conversation,
        message,
    }))
}

pub async fn list_conversations(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<Vec<ConversationSummary>>, AppError> {
    let svc = messaging_service(&state);
    let conversations = svc.list_conversations(user_id).await?;
    Ok(Json(conversations))
}

pub async fn get_conversation(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<ConversationSummary>, AppError> {
    let svc = messaging_service(&state);
    let conversation = svc.get_conversation(id, user_id).await?;
    Ok(Json(conversation))
}

pub async fn list_messages(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
    Query(query): Query<MessagesQuery>,
) -> Result<Json<Vec<MessageResponse>>, AppError> {
    let svc = messaging_service(&state);
    let messages = svc.list_messages(id, user_id, query.after, query.limit.unwrap_or(100)).await?;
    Ok(Json(messages))
}

pub async fn post_message(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<PostMessageRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    
    let svc = messaging_service(&state);
    let message = svc.post_message(id, user_id, body).await?;
    Ok(Json(message))
}

pub async fn mark_as_read(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let svc = messaging_service(&state);
    svc.mark_as_read(id, user_id).await?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn get_unread_count(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<UnreadCountResponse>, AppError> {
    let svc = messaging_service(&state);
    let count = svc.get_unread_count(user_id).await?;
    Ok(Json(UnreadCountResponse { count }))
}
