use async_trait::async_trait;
use crate::error::AppError;

#[async_trait]
pub trait PhoneProvider: Send + Sync {
    async fn send_sms(&self, phone: &str, body: &str) -> Result<(), AppError>;
}

pub struct StubPhoneProvider;

#[async_trait]
impl PhoneProvider for StubPhoneProvider {
    async fn send_sms(&self, phone: &str, body: &str) -> Result<(), AppError> {
        tracing::info!("[stub-sms] to={} body={}", phone, body);
        Ok(())
    }
}
