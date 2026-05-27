use crate::error::AppError;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct MessageRow {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub body: String,
    pub read_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[async_trait]
pub trait MessageRepository: Send + Sync {
    async fn create(
        &self,
        conversation_id: Uuid,
        sender_id: Uuid,
        body: String,
    ) -> Result<MessageRow, AppError>;

    async fn list_by_conversation(
        &self,
        conversation_id: Uuid,
        after: Option<DateTime<Utc>>,
        limit: i64,
    ) -> Result<Vec<MessageRow>, AppError>;

    async fn mark_as_read(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
    ) -> Result<(), AppError>;

    async fn get_unread_count(&self, user_id: Uuid) -> Result<i64, AppError>;
    
    async fn count_user_messages_last_hour(&self, user_id: Uuid) -> Result<i64, AppError>;
}

pub struct PgMessageRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl MessageRepository for PgMessageRepository {
    async fn create(
        &self,
        conversation_id: Uuid,
        sender_id: Uuid,
        body: String,
    ) -> Result<MessageRow, AppError> {
        let row = sqlx::query_as::<_, MessageRow>(
            r#"
            INSERT INTO messages (id, conversation_id, sender_id, body, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(conversation_id)
        .bind(sender_id)
        .bind(body)
        .fetch_one(&self.pool)
        .await?;
        Ok(row)
    }

    async fn list_by_conversation(
        &self,
        conversation_id: Uuid,
        after: Option<DateTime<Utc>>,
        limit: i64,
    ) -> Result<Vec<MessageRow>, AppError> {
        let rows = sqlx::query_as::<_, MessageRow>(
            r#"
            SELECT * FROM messages 
            WHERE conversation_id = $1 
              AND ($2::timestamptz IS NULL OR created_at > $2)
            ORDER BY created_at ASC
            LIMIT $3
            "#
        )
        .bind(conversation_id)
        .bind(after)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn mark_as_read(
        &self,
        conversation_id: Uuid,
        user_id: Uuid,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE messages 
            SET read_at = NOW() 
            WHERE conversation_id = $1 
              AND sender_id != $2 
              AND read_at IS NULL
            "#
        )
        .bind(conversation_id)
        .bind(user_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn get_unread_count(&self, user_id: Uuid) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE (c.buyer_id = $1 OR c.seller_id = $1)
              AND m.sender_id != $1
              AND m.read_at IS NULL
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(row.0)
    }

    async fn count_user_messages_last_hour(&self, user_id: Uuid) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND created_at > NOW() - INTERVAL '1 hour'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(row.0)
    }
}
