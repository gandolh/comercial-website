use crate::error::AppError;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
pub struct PasswordResetToken {
    pub user_id: Uuid,
    pub expires_at: DateTime<Utc>,
    pub used_at: Option<DateTime<Utc>>,
}

#[async_trait]
pub trait PasswordTokenRepository: Send + Sync {
    async fn create(&self, user_id: Uuid, token: &str, ttl_hours: i64) -> Result<(), AppError>;
    async fn find_by_token(&self, token: &str) -> Result<Option<PasswordResetToken>, AppError>;
    async fn mark_used(&self, token: &str) -> Result<(), AppError>;
    async fn delete_for_user(&self, user_id: Uuid) -> Result<(), AppError>;
}

pub struct PgPasswordTokenRepository {
    pool: PgPool,
}

impl PgPasswordTokenRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl PasswordTokenRepository for PgPasswordTokenRepository {
    async fn create(&self, user_id: Uuid, token: &str, ttl_hours: i64) -> Result<(), AppError> {
        let expires_at = Utc::now() + chrono::Duration::hours(ttl_hours);

        sqlx::query(
            r#"
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            "#,
        )
        .bind(user_id)
        .bind(token)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to create password token: {}", e))
        })?;

        Ok(())
    }

    async fn find_by_token(&self, token: &str) -> Result<Option<PasswordResetToken>, AppError> {
        let result = sqlx::query_as::<_, PasswordResetToken>(
            r#"
            SELECT user_id, expires_at, used_at
            FROM password_reset_tokens
            WHERE token = $1
            "#,
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to find password token: {}", e)))?;

        Ok(result)
    }

    async fn mark_used(&self, token: &str) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE password_reset_tokens
            SET used_at = NOW()
            WHERE token = $1 AND used_at IS NULL
            "#,
        )
        .bind(token)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to mark token as used: {}", e)))?;

        if result.rows_affected() == 0 {
            return Err(AppError::Validation(
                "Token already used or not found".into(),
            ));
        }

        Ok(())
    }

    async fn delete_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            DELETE FROM password_reset_tokens
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to delete password tokens: {}", e))
        })?;

        Ok(())
    }
}
