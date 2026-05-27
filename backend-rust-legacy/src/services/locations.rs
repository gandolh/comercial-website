use crate::{error::AppError, models::location::{City, County}, repositories::locations::LocationRepository};

pub struct LocationService<R: LocationRepository> {
    repo: R,
}

impl<R: LocationRepository> LocationService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }

    pub async fn get_counties(&self) -> Result<Vec<County>, AppError> {
        self.repo.get_counties().await
    }

    pub async fn search_cities(
        &self,
        q: &str,
        page: usize,
        limit: usize,
    ) -> Result<(Vec<City>, i64), AppError> {
        let limit = (limit.min(100)) as i64;
        let offset = ((page.max(1) - 1) as i64) * limit;
        let q = q.trim();
        let cities = self.repo.search_cities(q, offset, limit).await?;
        let total = self.repo.count_cities(q).await?;
        Ok((cities, total))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;

    struct MockLocationRepo {
        counties: Vec<County>,
        cities: Vec<City>,
    }

    #[async_trait]
    impl LocationRepository for MockLocationRepo {
        async fn get_counties(&self) -> Result<Vec<County>, AppError> {
            Ok(self.counties.clone())
        }
        async fn search_cities(&self, q: &str, offset: i64, limit: i64) -> Result<Vec<City>, AppError> {
            let q = q.to_lowercase();
            let filtered: Vec<City> = self.cities.iter()
                .filter(|c| q.is_empty() || c.name.to_lowercase().contains(&q))
                .skip(offset as usize)
                .take(limit as usize)
                .cloned()
                .collect();
            Ok(filtered)
        }
        async fn count_cities(&self, q: &str) -> Result<i64, AppError> {
            let q = q.to_lowercase();
            Ok(self.cities.iter()
                .filter(|c| q.is_empty() || c.name.to_lowercase().contains(&q))
                .count() as i64)
        }
    }

    fn make_city(id: i32, name: &str) -> City {
        City { id, name: name.to_string(), county_code: "CJ".to_string(), county_name: "Cluj".to_string(), longitude: 0.0, latitude: 0.0, population: 1000 }
    }

    #[tokio::test]
    async fn test_get_counties() {
        let repo = MockLocationRepo {
            counties: vec![County { code: "CJ".to_string(), name: "Cluj".to_string(), region: "Nord-Vest".to_string() }],
            cities: vec![],
        };
        let svc = LocationService::new(repo);
        let result = svc.get_counties().await.unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].code, "CJ");
    }

    #[tokio::test]
    async fn test_search_cities_filter() {
        let repo = MockLocationRepo {
            counties: vec![],
            cities: vec![make_city(1, "Cluj-Napoca"), make_city(2, "Timisoara"), make_city(3, "Clujana")],
        };
        let svc = LocationService::new(repo);
        let (cities, total) = svc.search_cities("cluj", 1, 10).await.unwrap();
        assert_eq!(total, 2);
        assert_eq!(cities.len(), 2);
    }

    #[tokio::test]
    async fn test_search_cities_pagination() {
        let repo = MockLocationRepo {
            counties: vec![],
            cities: (1..=5).map(|i| make_city(i, &format!("City {i}"))).collect(),
        };
        let svc = LocationService::new(repo);
        let (cities, total) = svc.search_cities("", 2, 2).await.unwrap();
        assert_eq!(total, 5);
        assert_eq!(cities.len(), 2);
    }
}
