use crate::{
    config::Config, 
    services::{email::EmailService, phone::PhoneProvider}
};
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    #[allow(dead_code)]
    pub s3: aws_sdk_s3::Client,
    pub config: Arc<Config>,
    pub email: Arc<dyn EmailService>,
    pub phone: Arc<dyn PhoneProvider>,
}
