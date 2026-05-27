use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;
use crate::dto::listing::ListingCardResponse;
use crate::dto::auth::UserSummary;

#[derive(Debug, Deserialize, Validate)]
pub struct StartConversationRequest {
    #[validate(length(min = 1, max = 2000, message = "Mesajul trebuie să aibă între 1 și 2000 de caractere"))]
    pub body: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct PostMessageRequest {
    #[validate(length(min = 1, max = 2000, message = "Mesajul trebuie să aibă între 1 și 2000 de caractere"))]
    pub body: String,
}

#[derive(Debug, Serialize)]
pub struct ConversationSummary {
    pub id: Uuid,
    pub listing: ListingCardResponse,
    pub counterparty: UserSummary,
    pub last_message: Option<MessagePreview>,
    pub unread_count: i64,
    pub last_message_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct MessagePreview {
    pub body: String,
    pub sender_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct MessageResponse {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub body: String,
    pub read_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UnreadCountResponse {
    pub count: i64,
}
