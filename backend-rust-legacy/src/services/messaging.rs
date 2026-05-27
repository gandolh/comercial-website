use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use regex::Regex;
use lazy_static::lazy_static;

use crate::{
    dto::{
        messaging::{
            ConversationSummary, MessagePreview, MessageResponse, 
            PostMessageRequest, StartConversationRequest
        },
        listing::ListingCardResponse,
        auth::UserSummary,
    },
    error::AppError,
    repositories::{
        conversations::{ConversationRepository, ConversationSummaryRow},
        messages::MessageRepository,
        listings::ListingRepository,
    },
};

lazy_static! {
    static ref PHONE_REGEX: Regex = Regex::new(r"\b\+?40\d{9}\b|\b0\d{9}\b").unwrap();
}

#[async_trait]
pub trait MessagingService: Send + Sync {
    async fn start_conversation(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
        req: StartConversationRequest,
    ) -> Result<(ConversationSummary, MessageResponse), AppError>;

    async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<ConversationSummary>, AppError>;

    async fn get_conversation(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<ConversationSummary, AppError>;

    async fn list_messages(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
        after: Option<DateTime<Utc>>,
        limit: i64,
    ) -> Result<Vec<MessageResponse>, AppError>;

    async fn post_message(
        &self,
        conversation_id: Uuid,
        sender_id: Uuid,
        req: PostMessageRequest,
    ) -> Result<MessageResponse, AppError>;

    async fn mark_as_read(&self, conversation_id: Uuid, user_id: Uuid) -> Result<(), AppError>;

    async fn get_unread_count(&self, user_id: Uuid) -> Result<i64, AppError>;
}

pub struct MessagingServiceImpl {
    pub conversation_repo: Arc<dyn ConversationRepository>,
    pub message_repo: Arc<dyn MessageRepository>,
    pub listing_repo: Arc<dyn ListingRepository>,
}

#[async_trait]
impl MessagingService for MessagingServiceImpl {
    async fn start_conversation(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
        req: StartConversationRequest,
    ) -> Result<(ConversationSummary, MessageResponse), AppError> {
        if PHONE_REGEX.is_match(&req.body) {
            return Err(AppError::Validation("Nu trimite numere de telefon în mesaje".into()));
        }

        let listing = self.listing_repo.find_by_id(listing_id).await?
            .ok_or(AppError::NotFound)?;

        if listing.user_id == buyer_id {
            return Err(AppError::Forbidden); // Cannot message self
        }

        // Check rate limit
        let count = self.message_repo.count_user_messages_last_hour(buyer_id).await?;
        if count >= 30 {
            return Err(AppError::RateLimit);
        }

        let conversation = if let Some(existing) = self.conversation_repo.find_by_listing_and_buyer(listing_id, buyer_id).await? {
            existing
        } else {
            self.conversation_repo.create(listing_id, buyer_id, listing.user_id).await?
        };

        let message_row = self.message_repo.create(conversation.id, buyer_id, req.body).await?;
        self.conversation_repo.update_last_message_at(conversation.id).await?;

        let summary = self.get_conversation(conversation.id, buyer_id).await?;
        
        let message_res = MessageResponse {
            id: message_row.id,
            conversation_id: message_row.conversation_id,
            sender_id: message_row.sender_id,
            body: message_row.body,
            read_at: message_row.read_at,
            created_at: message_row.created_at,
        };

        Ok((summary, message_res))
    }

    async fn list_conversations(&self, user_id: Uuid) -> Result<Vec<ConversationSummary>, AppError> {
        let rows = self.conversation_repo.list_for_user(user_id).await?;
        Ok(rows.into_iter().map(map_summary_row).collect())
    }

    async fn get_conversation(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<ConversationSummary, AppError> {
        let row = self.conversation_repo.get_summary_by_id(id, user_id).await?
            .ok_or(AppError::NotFound)?;
        Ok(map_summary_row(row))
    }

    async fn list_messages(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
        after: Option<DateTime<Utc>>,
        limit: i64,
    ) -> Result<Vec<MessageResponse>, AppError> {
        let conv = self.conversation_repo.find_by_id(conversation_id).await?
            .ok_or(AppError::NotFound)?;

        if conv.buyer_id != user_id && conv.seller_id != user_id {
            return Err(AppError::Forbidden);
        }

        let rows = self.message_repo.list_by_conversation(conversation_id, after, limit).await?;
        Ok(rows.into_iter().map(|m| MessageResponse {
            id: m.id,
            conversation_id: m.conversation_id,
            sender_id: m.sender_id,
            body: m.body,
            read_at: m.read_at,
            created_at: m.created_at,
        }).collect())
    }

    async fn post_message(
        &self,
        conversation_id: Uuid,
        sender_id: Uuid,
        req: PostMessageRequest,
    ) -> Result<MessageResponse, AppError> {
        let conv = self.conversation_repo.find_by_id(conversation_id).await?
            .ok_or(AppError::NotFound)?;

        if conv.buyer_id != sender_id && conv.seller_id != sender_id {
            return Err(AppError::Forbidden);
        }

        // Check rate limit
        let count = self.message_repo.count_user_messages_last_hour(sender_id).await?;
        if count >= 30 {
            return Err(AppError::RateLimit);
        }

        let message_row = self.message_repo.create(conversation_id, sender_id, req.body).await?;
        self.conversation_repo.update_last_message_at(conversation_id).await?;

        Ok(MessageResponse {
            id: message_row.id,
            conversation_id: message_row.conversation_id,
            sender_id: message_row.sender_id,
            body: message_row.body,
            read_at: message_row.read_at,
            created_at: message_row.created_at,
        })
    }

    async fn mark_as_read(&self, conversation_id: Uuid, user_id: Uuid) -> Result<(), AppError> {
        let conv = self.conversation_repo.find_by_id(conversation_id).await?
            .ok_or(AppError::NotFound)?;

        if conv.buyer_id != user_id && conv.seller_id != user_id {
            return Err(AppError::Forbidden);
        }

        self.message_repo.mark_as_read(conversation_id, user_id).await?;
        Ok(())
    }

    async fn get_unread_count(&self, user_id: Uuid) -> Result<i64, AppError> {
        self.message_repo.get_unread_count(user_id).await
    }
}

fn map_summary_row(row: ConversationSummaryRow) -> ConversationSummary {
    ConversationSummary {
        id: row.id,
        listing: ListingCardResponse {
            id: row.listing_id,
            title: row.listing_title,
            price_ron: row.listing_price_ron,
            city: row.listing_city,
            category: row.listing_category,
            cover_url: row.listing_cover_url,
            seller_verified: row.listing_seller_verified,
            posted_at: row.listing_posted_at,
            active: row.listing_active,
            expires_at: row.listing_expires_at,
        },
        counterparty: UserSummary {
            id: row.counterparty_id,
            email: row.counterparty_email,
            display_name: row.counterparty_display_name,
            avatar_url: row.counterparty_avatar_url,
            email_verified: row.counterparty_email_verified,
            phone: row.counterparty_phone,
            phone_verified: row.counterparty_phone_verified,
            created_at: row.counterparty_created_at,
        },
        last_message: row.last_message_body.map(|body| MessagePreview {
            body,
            sender_id: row.last_message_sender_id.unwrap(),
            created_at: row.last_message_created_at.unwrap(),
        }),
        unread_count: row.unread_count,
        last_message_at: row.last_message_at,
    }
}
