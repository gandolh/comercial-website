use crate::{dto::listing::ListingFilters, error::AppError};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct FavoriteListingRow {
    pub id: Uuid,
    pub title: String,
    pub price_ron: Option<i64>,
    pub city: String,
    pub category: String,
    pub cover_url: Option<String>,
    pub seller_verified: bool,
    pub posted_at: DateTime<Utc>,
    pub active: bool,
    pub expires_at: DateTime<Utc>,
}

#[async_trait]
pub trait FavoriteRepository: Send + Sync {
    async fn add(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError>;
    async fn remove(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError>;
    async fn list_ids(&self, user_id: Uuid) -> Result<Vec<Uuid>, AppError>;
    async fn list(
        &self,
        user_id: Uuid,
        filters: &ListingFilters,
    ) -> Result<(Vec<FavoriteListingRow>, i64), AppError>;
}

pub struct PgFavoriteRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl FavoriteRepository for PgFavoriteRepository {
    async fn add(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO favorites (user_id, listing_id)
            SELECT $1, $2
            WHERE EXISTS (SELECT 1 FROM listings WHERE id = $2)
            ON CONFLICT (user_id, listing_id) DO NOTHING
            "#,
        )
        .bind(user_id)
        .bind(listing_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn remove(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError> {
        sqlx::query("DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2")
            .bind(user_id)
            .bind(listing_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn list_ids(&self, user_id: Uuid) -> Result<Vec<Uuid>, AppError> {
        let rows = sqlx::query_as::<_, (Uuid,)>(
            "SELECT listing_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(|row| row.0).collect())
    }

    async fn list(
        &self,
        user_id: Uuid,
        filters: &ListingFilters,
    ) -> Result<(Vec<FavoriteListingRow>, i64), AppError> {
        let page = filters.page();
        let per_page = filters.per_page();
        let offset = filters.offset();

        let rows = sqlx::query_as::<_, FavoriteListingRow>(
            r#"
            SELECT
                l.id,
                l.title,
                l.price_ron,
                l.city,
                l.category,
                (SELECT li.s3_key FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.position ASC LIMIT 1) AS cover_url,
                u.phone_verified AS seller_verified,
                l.created_at AS posted_at,
                l.active,
                l.expires_at
            FROM favorites f
            JOIN listings l ON l.id = f.listing_id
            JOIN users u ON u.id = l.user_id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        let total_row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM favorites WHERE user_id = $1")
            .bind(user_id)
            .fetch_one(&self.pool)
            .await?;

        let _ = page;
        Ok((rows, total_row.0))
    }
}
