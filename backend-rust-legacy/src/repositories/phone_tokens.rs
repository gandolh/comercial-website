use crate::error::AppError;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[allow(dead_code)]
#[derive(sqlx::FromRow, Clone)]
pub struct PhoneVerificationCode {
    pub id: Uuid,
    pub user_id: Uuid,
    pub phone: String,
    pub code_hash: String,
    pub attempts: i32,
    pub expires_at: DateTime<Utc>,
    pub consumed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[async_trait]
pub trait PhoneTokenRepository: Send + Sync {
    async fn create(&self, user_id: Uuid, phone: &str, code_hash: &str) -> Result<(), AppError>;
    async fn find_latest_for_user(&self, user_id: Uuid) -> Result<Option<PhoneVerificationCode>, AppError>;
    async fn increment_attempts(&self, id: Uuid) -> Result<(), AppError>;
    async fn mark_consumed(&self, id: Uuid) -> Result<(), AppError>;
    async fn mark_all_consumed_for_user(&self, user_id: Uuid) -> Result<(), AppError>;
    async fn count_recent_requests(&self, user_id: Uuid, since: DateTime<Utc>) -> Result<i64, AppError>;
}

pub struct PgPhoneTokenRepository {
    pool: PgPool,
}

impl PgPhoneTokenRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl PhoneTokenRepository for PgPhoneTokenRepository {
    async fn create(&self, user_id: Uuid, phone: &str, code_hash: &str) -> Result<(), AppError> {
        let expires_at = Utc::now() + chrono::Duration::minutes(10);

        sqlx::query(
            r#"
            INSERT INTO phone_verification_codes (user_id, phone, code_hash, expires_at)
            VALUES ($1, $2, $3, $4)
            "#,
        )
        .bind(user_id)
        .bind(phone)
        .bind(code_hash)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create phone token: {}", e)))?;

        Ok(())
    }

    async fn find_latest_for_user(&self, user_id: Uuid) -> Result<Option<PhoneVerificationCode>, AppError> {
        let result = sqlx::query_as::<_, PhoneVerificationCode>(
            r#"
            SELECT id, user_id, phone, code_hash, attempts, expires_at, consumed_at, created_at
            FROM phone_verification_codes
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to find latest phone token: {}", e)))?;

        Ok(result)
    }

    async fn increment_attempts(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE phone_verification_codes
            SET attempts = attempts + 1
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to increment attempts: {}", e)))?;

        Ok(())
    }

    async fn mark_consumed(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE phone_verification_codes
            SET consumed_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to mark token as consumed: {}", e)))?;

        Ok(())
    }

    async fn mark_all_consumed_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE phone_verification_codes
            SET consumed_at = NOW()
            WHERE user_id = $1 AND consumed_at IS NULL
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to mark all tokens as consumed: {}", e)))?;

        Ok(())
    }

    async fn count_recent_requests(&self, user_id: Uuid, since: DateTime<Utc>) -> Result<i64, AppError> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM phone_verification_codes
            WHERE user_id = $1 AND created_at >= $2
            "#,
        )
        .bind(user_id)
        .bind(since)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to count recent requests: {}", e)))?;

        Ok(count.0)
    }
}
