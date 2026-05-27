use serde::Serialize;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct County {
    pub code: String,
    pub name: String,
    pub region: String,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct City {
    pub id: i32,
    pub name: String,
    pub county_code: String,
    pub county_name: String,
    pub longitude: f64,
    pub latitude: f64,
    pub population: i32,
}
