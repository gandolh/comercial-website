use crate::{
    dto::listing::{CreateListingRequest, ListingFilters, UpdateListingRequest},
    error::AppError,
    models::listing::Listing,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ListingCardRow {
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

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ListingDetailRow {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    pub category: String,
    pub city: String,
    pub active: bool,
    pub view_count: i64,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub seller_id: Uuid,
    pub seller_display_name: Option<String>,
    pub seller_avatar_url: Option<String>,
    pub seller_phone_verified: bool,
    pub seller_member_since: DateTime<Utc>,
    pub seller_active_listings_count: i64,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct ListingImageRow {
    pub id: Uuid,
    pub s3_key: String,
    pub position: i32,
}

#[async_trait]
pub trait ListingRepository: Send + Sync {
    async fn create(&self, user_id: Uuid, data: &CreateListingRequest)
        -> Result<Listing, AppError>;
    async fn list_by_user(
        &self,
        user_id: Uuid,
        active: Option<bool>,
    ) -> Result<Vec<Listing>, AppError>;
    async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError>;
    async fn count_this_week(&self, user_id: Uuid) -> Result<i64, AppError>;
    async fn search(
        &self,
        filters: &ListingFilters,
    ) -> Result<(Vec<ListingCardRow>, i64), AppError>;
    async fn featured(&self, limit: i64) -> Result<Vec<ListingCardRow>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Listing>, AppError>;
    async fn find_detail(&self, id: Uuid) -> Result<Option<ListingDetailRow>, AppError>;
    async fn list_images(&self, listing_id: Uuid) -> Result<Vec<ListingImageRow>, AppError>;
    async fn increment_view_count(&self, id: Uuid) -> Result<(), AppError>;
    async fn list_related(
        &self,
        category: &str,
        exclude_id: Uuid,
        limit: i64,
    ) -> Result<Vec<ListingCardRow>, AppError>;
    async fn update(
        &self,
        id: Uuid,
        owner_id: Uuid,
        patch: &UpdateListingRequest,
    ) -> Result<Listing, AppError>;
    async fn renew(&self, id: Uuid, owner_id: Uuid) -> Result<Listing, AppError>;
    async fn set_active(&self, id: Uuid, owner_id: Uuid, active: bool) -> Result<Listing, AppError>;
    async fn publish(&self, id: Uuid, owner_id: Uuid) -> Result<Listing, AppError>;
    async fn suggest_titles(&self, q: &str, limit: i64) -> Result<Vec<String>, AppError>;
}

pub struct PgListingRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl ListingRepository for PgListingRepository {
    async fn create(
        &self,
        user_id: Uuid,
        data: &CreateListingRequest,
    ) -> Result<Listing, AppError> {
        let listing = sqlx::query_as::<_, Listing>(
            r#"
            INSERT INTO listings (user_id, title, description, price_ron, is_negotiable, category, city, active, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '30 days')
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(&data.title)
        .bind(&data.description)
        .bind(data.price_ron)
        .bind(data.is_negotiable)
        .bind(&data.category)
        .bind(&data.city)
        .bind(data.active.unwrap_or(true))
        .fetch_one(&self.pool)
        .await?;
        Ok(listing)
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        active: Option<bool>,
    ) -> Result<Vec<Listing>, AppError> {
        let listings = if let Some(active) = active {
            sqlx::query_as::<_, Listing>(
                "SELECT * FROM listings WHERE user_id = $1 AND active = $2 ORDER BY created_at DESC",
            )
            .bind(user_id)
            .bind(active)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as::<_, Listing>(
                "SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC",
            )
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?
        };
        Ok(listings)
    }

    async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM listings WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(owner_id)
            .execute(&self.pool)
            .await?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }
        Ok(())
    }

    async fn count_this_week(&self, user_id: Uuid) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM listings WHERE user_id = $1 AND active = TRUE AND created_at >= NOW() - INTERVAL '7 days'",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(row.0)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Listing>, AppError> {
        let listing = sqlx::query_as::<_, Listing>("SELECT * FROM listings WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(listing)
    }

    async fn search(
        &self,
        filters: &ListingFilters,
    ) -> Result<(Vec<ListingCardRow>, i64), AppError> {
        let query = filters.normalized_query();
        let rows = sqlx::query_as::<_, ListingCardRow>(
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
            FROM listings l
            JOIN users u ON u.id = l.user_id
            WHERE l.active = TRUE
              AND l.expires_at > NOW()
              AND ($1 = '' OR l.search_tsv @@ plainto_tsquery('simple', unaccent($1)))
              AND ($2::text IS NULL OR l.category = $2)
              AND ($3::text IS NULL OR l.city = $3 OR unaccent(l.city) = unaccent($3))
              AND ($4::bigint IS NULL OR l.price_ron >= $4)
              AND ($5::bigint IS NULL OR l.price_ron <= $5)
              AND (
                    $6::text IS NULL
                    OR $6 = 'oricand'
                    OR ($6 = '24h' AND l.created_at >= NOW() - INTERVAL '24 hours')
                    OR ($6 = 'saptamana' AND l.created_at >= NOW() - INTERVAL '7 days')
                  )
              AND ($7::bool = FALSE OR u.phone_verified = TRUE)
            ORDER BY
              CASE WHEN $8 = 'pret_asc' THEN l.price_ron END ASC NULLS LAST,
              CASE WHEN $8 = 'pret_desc' THEN l.price_ron END DESC NULLS LAST,
              CASE WHEN $8 = 'relevanta' AND $1 <> '' THEN ts_rank(l.search_tsv, plainto_tsquery('simple', unaccent($1))) END DESC NULLS LAST,
              l.created_at DESC
            LIMIT $9 OFFSET $10
            "#,
        )
        .bind(&query)
        .bind(filters.category.as_deref())
        .bind(filters.city.as_deref())
        .bind(filters.price_min)
        .bind(filters.price_max)
        .bind(filters.date.as_deref())
        .bind(filters.verified_only())
        .bind(filters.normalized_sort())
        .bind(filters.per_page())
        .bind(filters.offset())
        .fetch_all(&self.pool)
        .await?;

        let total_row: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM listings l
            JOIN users u ON u.id = l.user_id
            WHERE l.active = TRUE
              AND l.expires_at > NOW()
              AND ($1 = '' OR l.search_tsv @@ plainto_tsquery('simple', unaccent($1)))
              AND ($2::text IS NULL OR l.category = $2)
              AND ($3::text IS NULL OR l.city = $3 OR unaccent(l.city) = unaccent($3))
              AND ($4::bigint IS NULL OR l.price_ron >= $4)
              AND ($5::bigint IS NULL OR l.price_ron <= $5)
              AND (
                    $6::text IS NULL
                    OR $6 = 'oricand'
                    OR ($6 = '24h' AND l.created_at >= NOW() - INTERVAL '24 hours')
                    OR ($6 = 'saptamana' AND l.created_at >= NOW() - INTERVAL '7 days')
                  )
              AND ($7::bool = FALSE OR u.phone_verified = TRUE)
            "#,
        )
        .bind(&query)
        .bind(filters.category.as_deref())
        .bind(filters.city.as_deref())
        .bind(filters.price_min)
        .bind(filters.price_max)
        .bind(filters.date.as_deref())
        .bind(filters.verified_only())
        .fetch_one(&self.pool)
        .await?;

        Ok((rows, total_row.0))
    }

    async fn featured(&self, limit: i64) -> Result<Vec<ListingCardRow>, AppError> {
        let rows = sqlx::query_as::<_, ListingCardRow>(
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
            FROM listings l
            JOIN users u ON u.id = l.user_id
            WHERE l.active = TRUE
              AND l.expires_at > NOW()
            ORDER BY u.phone_verified DESC, l.created_at DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn find_detail(&self, id: Uuid) -> Result<Option<ListingDetailRow>, AppError> {
        let row = sqlx::query_as::<_, ListingDetailRow>(
            r#"
            SELECT
                l.id,
                l.user_id,
                l.title,
                l.description,
                l.price_ron,
                l.is_negotiable,
                l.category,
                l.city,
                l.active,
                l.view_count,
                l.expires_at,
                l.created_at,
                u.id AS seller_id,
                u.display_name AS seller_display_name,
                u.avatar_url AS seller_avatar_url,
                u.phone_verified AS seller_phone_verified,
                u.created_at AS seller_member_since,
                (SELECT COUNT(*) FROM listings sl WHERE sl.user_id = u.id AND sl.active = TRUE AND sl.expires_at > NOW()) AS seller_active_listings_count
            FROM listings l
            JOIN users u ON u.id = l.user_id
            WHERE l.id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row)
    }

    async fn list_images(&self, listing_id: Uuid) -> Result<Vec<ListingImageRow>, AppError> {
        let rows = sqlx::query_as::<_, ListingImageRow>(
            "SELECT id, s3_key, position FROM listing_images WHERE listing_id = $1 ORDER BY position ASC",
        )
        .bind(listing_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn increment_view_count(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE listings SET view_count = view_count + 1 WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn list_related(
        &self,
        category: &str,
        exclude_id: Uuid,
        limit: i64,
    ) -> Result<Vec<ListingCardRow>, AppError> {
        let rows = sqlx::query_as::<_, ListingCardRow>(
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
            FROM listings l
            JOIN users u ON u.id = l.user_id
            WHERE l.category = $1
              AND l.id != $2
              AND l.active = TRUE
              AND l.expires_at > NOW()
            ORDER BY l.created_at DESC
            LIMIT $3
            "#,
        )
        .bind(category)
        .bind(exclude_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn update(
        &self,
        id: Uuid,
        owner_id: Uuid,
        patch: &UpdateListingRequest,
    ) -> Result<Listing, AppError> {
        let price_in_patch = patch.price_ron.is_some();
        let price_value = patch.price_ron.clone().flatten();

        let listing = sqlx::query_as::<_, Listing>(
            r#"
            UPDATE listings
            SET title = COALESCE($3, title),
                description = COALESCE($4, description),
                price_ron = CASE WHEN $5 THEN $6 ELSE price_ron END,
                is_negotiable = COALESCE($7, is_negotiable),
                category = COALESCE($8, category),
                city = COALESCE($9, city),
                active = COALESCE($10, active),
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(owner_id)
        .bind(patch.title.as_ref())
        .bind(patch.description.as_ref())
        .bind(price_in_patch)
        .bind(price_value)
        .bind(patch.is_negotiable)
        .bind(patch.category.as_ref())
        .bind(patch.city.as_ref())
        .bind(patch.active)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(AppError::NotFound)?;

        Ok(listing)
    }

    async fn renew(&self, id: Uuid, owner_id: Uuid) -> Result<Listing, AppError> {
        let listing = sqlx::query_as::<_, Listing>(
            r#"
            UPDATE listings
            SET expires_at = NOW() + INTERVAL '30 days',
                active = TRUE,
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(owner_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(AppError::NotFound)?;

        Ok(listing)
    }

    async fn set_active(&self, id: Uuid, owner_id: Uuid, active: bool) -> Result<Listing, AppError> {
        let listing = sqlx::query_as::<_, Listing>(
            r#"
            UPDATE listings
            SET active = $3,
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(owner_id)
        .bind(active)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(AppError::NotFound)?;

        Ok(listing)
    }

    async fn publish(&self, id: Uuid, owner_id: Uuid) -> Result<Listing, AppError> {
        let listing = sqlx::query_as::<_, Listing>(
            r#"
            UPDATE listings
            SET active = TRUE,
                expires_at = NOW() + INTERVAL '30 days',
                created_at = NOW(),
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(owner_id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(AppError::NotFound)?;

        Ok(listing)
    }

    async fn suggest_titles(&self, q: &str, limit: i64) -> Result<Vec<String>, AppError> {
        let rows = sqlx::query_scalar::<_, String>(
            r#"
            SELECT DISTINCT title
            FROM listings
            WHERE active = TRUE
              AND expires_at > NOW()
              AND ($1 = '' OR title ILIKE $2)
            ORDER BY title
            LIMIT $3
            "#,
        )
        .bind(q)
        .bind(format!("%{}%", q))
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }
}
