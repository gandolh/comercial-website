use crate::error::AppError;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ConversationRow {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub buyer_id: Uuid,
    pub seller_id: Uuid,
    pub last_message_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ConversationSummaryRow {
    pub id: Uuid,
    pub last_message_at: DateTime<Utc>,
    pub unread_count: i64,
    // Listing fields
    pub listing_id: Uuid,
    pub listing_title: String,
    pub listing_price_ron: Option<i64>,
    pub listing_city: String,
    pub listing_category: String,
    pub listing_cover_url: Option<String>,
    pub listing_seller_verified: bool,
    pub listing_posted_at: DateTime<Utc>,
    pub listing_active: bool,
    pub listing_expires_at: DateTime<Utc>,
    // Counterparty fields
    pub counterparty_id: Uuid,
    pub counterparty_email: String,
    pub counterparty_display_name: Option<String>,
    pub counterparty_avatar_url: Option<String>,
    pub counterparty_email_verified: bool,
    pub counterparty_phone: Option<String>,
    pub counterparty_phone_verified: bool,
    pub counterparty_created_at: DateTime<Utc>,
    // Last message fields
    pub last_message_body: Option<String>,
    pub last_message_sender_id: Option<Uuid>,
    pub last_message_created_at: Option<DateTime<Utc>>,
}

#[async_trait]
pub trait ConversationRepository: Send + Sync {
    async fn find_by_listing_and_buyer(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
    ) -> Result<Option<ConversationRow>, AppError>;

    async fn create(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
        seller_id: Uuid,
    ) -> Result<ConversationRow, AppError>;

    async fn find_by_id(&self, id: Uuid) -> Result<Option<ConversationRow>, AppError>;

    async fn list_for_user(&self, user_id: Uuid) -> Result<Vec<ConversationSummaryRow>, AppError>;

    async fn update_last_message_at(&self, id: Uuid) -> Result<(), AppError>;
    
    async fn get_summary_by_id(&self, id: Uuid, user_id: Uuid) -> Result<Option<ConversationSummaryRow>, AppError>;
}

pub struct PgConversationRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl ConversationRepository for PgConversationRepository {
    async fn find_by_listing_and_buyer(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
    ) -> Result<Option<ConversationRow>, AppError> {
        let row = sqlx::query_as::<_, ConversationRow>(
            "SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2",
        )
        .bind(listing_id)
        .bind(buyer_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row)
    }

    async fn create(
        &self,
        listing_id: Uuid,
        buyer_id: Uuid,
        seller_id: Uuid,
    ) -> Result<ConversationRow, AppError> {
        let row = sqlx::query_as::<_, ConversationRow>(
            r#"
            INSERT INTO conversations (id, listing_id, buyer_id, seller_id, last_message_at, created_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(listing_id)
        .bind(buyer_id)
        .bind(seller_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(row)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<ConversationRow>, AppError> {
        let row = sqlx::query_as::<_, ConversationRow>("SELECT * FROM conversations WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(row)
    }

    async fn list_for_user(&self, user_id: Uuid) -> Result<Vec<ConversationSummaryRow>, AppError> {
        let rows = sqlx::query_as::<_, ConversationSummaryRow>(
            r#"
            SELECT 
                c.id,
                c.last_message_at,
                (
                    SELECT COUNT(*) 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                      AND m.sender_id != $1 
                      AND m.read_at IS NULL
                ) as unread_count,
                l.id as listing_id,
                l.title as listing_title,
                l.price_ron as listing_price_ron,
                l.city as listing_city,
                l.category as listing_category,
                (SELECT li.s3_key FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.position ASC LIMIT 1) as listing_cover_url,
                u_seller.phone_verified as listing_seller_verified,
                l.created_at as listing_posted_at,
                l.active as listing_active,
                l.expires_at as listing_expires_at,
                u_other.id as counterparty_id,
                u_other.email as counterparty_email,
                u_other.display_name as counterparty_display_name,
                u_other.avatar_url as counterparty_avatar_url,
                u_other.email_verified as counterparty_email_verified,
                u_other.phone as counterparty_phone,
                u_other.phone_verified as counterparty_phone_verified,
                u_other.created_at as counterparty_created_at,
                m_last.body as last_message_body,
                m_last.sender_id as last_message_sender_id,
                m_last.created_at as last_message_created_at
            FROM conversations c
            JOIN listings l ON l.id = c.listing_id
            JOIN users u_seller ON u_seller.id = l.user_id
            JOIN users u_other ON u_other.id = CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END
            LEFT JOIN LATERAL (
                SELECT body, sender_id, created_at 
                FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) m_last ON true
            WHERE c.buyer_id = $1 OR c.seller_id = $1
            ORDER BY c.last_message_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn update_last_message_at(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE conversations SET last_message_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn get_summary_by_id(&self, id: Uuid, user_id: Uuid) -> Result<Option<ConversationSummaryRow>, AppError> {
        let row = sqlx::query_as::<_, ConversationSummaryRow>(
            r#"
            SELECT 
                c.id,
                c.last_message_at,
                (
                    SELECT COUNT(*) 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                      AND m.sender_id != $1 
                      AND m.read_at IS NULL
                ) as unread_count,
                l.id as listing_id,
                l.title as listing_title,
                l.price_ron as listing_price_ron,
                l.city as listing_city,
                l.category as listing_category,
                (SELECT li.s3_key FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.position ASC LIMIT 1) as listing_cover_url,
                u_seller.phone_verified as listing_seller_verified,
                l.created_at as listing_posted_at,
                l.active as listing_active,
                l.expires_at as listing_expires_at,
                u_other.id as counterparty_id,
                u_other.email as counterparty_email,
                u_other.display_name as counterparty_display_name,
                u_other.avatar_url as counterparty_avatar_url,
                u_other.email_verified as counterparty_email_verified,
                u_other.phone as counterparty_phone,
                u_other.phone_verified as counterparty_phone_verified,
                u_other.created_at as counterparty_created_at,
                m_last.body as last_message_body,
                m_last.sender_id as last_message_sender_id,
                m_last.created_at as last_message_created_at
            FROM conversations c
            JOIN listings l ON l.id = c.listing_id
            JOIN users u_seller ON u_seller.id = l.user_id
            JOIN users u_other ON u_other.id = CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END
            LEFT JOIN LATERAL (
                SELECT body, sender_id, created_at 
                FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) m_last ON true
            WHERE c.id = $2 AND (c.buyer_id = $1 OR c.seller_id = $1)
            "#
        )
        .bind(user_id)
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row)
    }
}
