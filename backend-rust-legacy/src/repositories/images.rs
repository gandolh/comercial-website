use async_trait::async_trait;
use uuid::Uuid;

use crate::error::AppError;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ListingImageDb {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub s3_key: String,
    pub position: i32,
}

#[async_trait]
pub trait ImageRepository: Send + Sync {
    async fn find_listing_owner(&self, listing_id: Uuid) -> Result<Option<Uuid>, AppError>;
    async fn count_for_listing(&self, listing_id: Uuid) -> Result<i64, AppError>;
    async fn insert_image(
        &self,
        listing_id: Uuid,
        s3_key: &str,
        width: Option<i32>,
        height: Option<i32>,
        bytes: Option<i64>,
    ) -> Result<ListingImageDb, AppError>;
    async fn list_for_listing(&self, listing_id: Uuid) -> Result<Vec<ListingImageDb>, AppError>;
    async fn reorder(
        &self,
        listing_id: Uuid,
        order: &[Uuid],
    ) -> Result<Vec<ListingImageDb>, AppError>;
    async fn delete_image(
        &self,
        listing_id: Uuid,
        image_id: Uuid,
    ) -> Result<Option<ListingImageDb>, AppError>;
}

#[derive(Debug, Clone)]
pub struct PgImageRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl ImageRepository for PgImageRepository {
    async fn find_listing_owner(&self, listing_id: Uuid) -> Result<Option<Uuid>, AppError> {
        let owner = sqlx::query_scalar::<_, Uuid>("SELECT user_id FROM listings WHERE id = $1")
            .bind(listing_id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(owner)
    }

    async fn count_for_listing(&self, listing_id: Uuid) -> Result<i64, AppError> {
        let count = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM listing_images WHERE listing_id = $1",
        )
        .bind(listing_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(count)
    }

    async fn insert_image(
        &self,
        listing_id: Uuid,
        s3_key: &str,
        width: Option<i32>,
        height: Option<i32>,
        bytes: Option<i64>,
    ) -> Result<ListingImageDb, AppError> {
        let row = sqlx::query_as::<_, ListingImageDb>(
            r#"
            INSERT INTO listing_images (listing_id, s3_key, width, height, bytes, position)
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                COALESCE((SELECT MAX(position) + 1 FROM listing_images WHERE listing_id = $1), 0)
            )
            RETURNING id, listing_id, s3_key, position
            "#,
        )
        .bind(listing_id)
        .bind(s3_key)
        .bind(width)
        .bind(height)
        .bind(bytes)
        .fetch_one(&self.pool)
        .await?;

        Ok(row)
    }

    async fn list_for_listing(&self, listing_id: Uuid) -> Result<Vec<ListingImageDb>, AppError> {
        let rows = sqlx::query_as::<_, ListingImageDb>(
            "SELECT id, listing_id, s3_key, position FROM listing_images WHERE listing_id = $1 ORDER BY position ASC",
        )
        .bind(listing_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    async fn reorder(
        &self,
        listing_id: Uuid,
        order: &[Uuid],
    ) -> Result<Vec<ListingImageDb>, AppError> {
        let mut tx = self.pool.begin().await?;

        for (index, image_id) in order.iter().enumerate() {
            sqlx::query(
                "UPDATE listing_images SET position = $1 WHERE id = $2 AND listing_id = $3",
            )
            .bind(-((index as i32) + 1))
            .bind(image_id)
            .bind(listing_id)
            .execute(&mut *tx)
            .await?;
        }

        for (index, image_id) in order.iter().enumerate() {
            sqlx::query(
                "UPDATE listing_images SET position = $1 WHERE id = $2 AND listing_id = $3",
            )
            .bind(index as i32)
            .bind(image_id)
            .bind(listing_id)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;

        self.list_for_listing(listing_id).await
    }

    async fn delete_image(
        &self,
        listing_id: Uuid,
        image_id: Uuid,
    ) -> Result<Option<ListingImageDb>, AppError> {
        let mut tx = self.pool.begin().await?;

        let deleted = sqlx::query_as::<_, ListingImageDb>(
            "DELETE FROM listing_images WHERE id = $1 AND listing_id = $2 RETURNING id, listing_id, s3_key, position",
        )
        .bind(image_id)
        .bind(listing_id)
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(ref image) = deleted {
            sqlx::query(
                "UPDATE listing_images SET position = position - 1 WHERE listing_id = $1 AND position > $2",
            )
            .bind(listing_id)
            .bind(image.position)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(deleted)
    }
}
