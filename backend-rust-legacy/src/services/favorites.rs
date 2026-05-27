use crate::{
    config::Config,
    dto::listing::{
        FavoritesIdsResponse, ListingCardResponse, ListingFilters, ListingsPageResponse,
    },
    error::AppError,
    repositories::favorites::{FavoriteListingRow, FavoriteRepository},
};
use std::sync::Arc;
use uuid::Uuid;

pub struct FavoriteService<R: FavoriteRepository> {
    repo: Arc<R>,
    config: Arc<Config>,
}

impl<R: FavoriteRepository> FavoriteService<R> {
    pub fn new(repo: Arc<R>, config: Arc<Config>) -> Self {
        Self { repo, config }
    }

    pub async fn add(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError> {
        self.repo.add(user_id, listing_id).await
    }

    pub async fn remove(&self, user_id: Uuid, listing_id: Uuid) -> Result<(), AppError> {
        self.repo.remove(user_id, listing_id).await
    }

    pub async fn list_ids(&self, user_id: Uuid) -> Result<FavoritesIdsResponse, AppError> {
        let ids = self.repo.list_ids(user_id).await?;
        Ok(FavoritesIdsResponse { ids })
    }

    pub async fn list(
        &self,
        user_id: Uuid,
        filters: &ListingFilters,
    ) -> Result<ListingsPageResponse, AppError> {
        let (rows, total_count) = self.repo.list(user_id, filters).await?;
        let per_page = filters.per_page();
        let total_pages = if total_count == 0 {
            0
        } else {
            (total_count + per_page - 1) / per_page
        };

        Ok(ListingsPageResponse {
            listings: rows
                .into_iter()
                .map(|row| map_row(row, &self.config))
                .collect(),
            total_count,
            total_pages,
            page: filters.page(),
        })
    }
}

fn map_row(row: FavoriteListingRow, config: &Config) -> ListingCardResponse {
    ListingCardResponse {
        id: row.id,
        title: row.title,
        price_ron: row.price_ron,
        city: row.city,
        category: row.category,
        cover_url: map_image_url(row.cover_url, config),
        seller_verified: row.seller_verified,
        posted_at: row.posted_at,
        active: row.active,
        expires_at: row.expires_at,
    }
}

fn map_image_url(value: Option<String>, config: &Config) -> Option<String> {
    value.map(|raw| {
        if raw.starts_with("http://") || raw.starts_with("https://") {
            raw
        } else {
            format!(
                "https://{}.s3.{}.amazonaws.com/{}",
                config.aws_s3_bucket,
                config.aws_region,
                raw.trim_start_matches('/')
            )
        }
    })
}
