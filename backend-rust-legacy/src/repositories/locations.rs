use crate::{error::AppError, models::location::{City, County}};
use async_trait::async_trait;
use sqlx::PgPool;

#[async_trait]
pub trait LocationRepository: Send + Sync {
    async fn get_counties(&self) -> Result<Vec<County>, AppError>;
    async fn search_cities(&self, q: &str, offset: i64, limit: i64) -> Result<Vec<City>, AppError>;
    async fn count_cities(&self, q: &str) -> Result<i64, AppError>;
}

pub struct PgLocationRepository {
    pub db: PgPool,
}

#[async_trait]
impl LocationRepository for PgLocationRepository {
    async fn get_counties(&self) -> Result<Vec<County>, AppError> {
        sqlx::query_as!(County, "SELECT code, name, region FROM counties ORDER BY name")
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppError::Internal(e.into()))
    }

    async fn search_cities(&self, q: &str, offset: i64, limit: i64) -> Result<Vec<City>, AppError> {
        let pattern = format!("%{}%", q.to_lowercase());
        sqlx::query_as!(
            City,
            r#"SELECT c.id, c.name, c.county_code, co.name AS county_name, c.longitude, c.latitude, c.population
             FROM cities c
             JOIN counties co ON co.code = c.county_code
             WHERE LOWER(c.name) LIKE $1
             ORDER BY
               CASE c.county_code
                 WHEN 'B'  THEN 0
                 WHEN 'TM' THEN 1
                 WHEN 'CJ' THEN 2
                 WHEN 'SB' THEN 3
                 WHEN 'BV' THEN 4
                 ELSE 5
               END,
               c.name
             LIMIT $2 OFFSET $3"#,
            pattern,
            limit,
            offset
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| AppError::Internal(e.into()))
    }

    async fn count_cities(&self, q: &str) -> Result<i64, AppError> {
        let pattern = format!("%{}%", q.to_lowercase());
        sqlx::query_scalar!(
            "SELECT COUNT(*) FROM cities WHERE LOWER(name) LIKE $1",
            pattern,
        )
        .fetch_one(&self.db)
        .await
        .map(|c| c.unwrap_or(0))
        .map_err(|e| AppError::Internal(e.into()))
    }
}
