use crate::config::Config;
use crate::error::AppError;
use async_trait::async_trait;
use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, AsyncSmtpTransport,
    AsyncTransport, Message, Tokio1Executor,
};
use std::sync::Arc;

#[async_trait]
pub trait EmailService: Send + Sync {
    async fn send_verification_email(&self, to: &str, token: &str) -> Result<(), AppError>;
    async fn send_password_reset_email(&self, to: &str, token: &str) -> Result<(), AppError>;
}

pub struct SmtpEmailService {
    config: Arc<Config>,
    mailer: AsyncSmtpTransport<Tokio1Executor>,
}

impl SmtpEmailService {
    pub fn new(config: Arc<Config>) -> Result<Self, AppError> {
        let creds = Credentials::new(config.smtp_username.clone(), config.smtp_password.clone());

        let mailer = AsyncSmtpTransport::<Tokio1Executor>::relay(&config.smtp_host)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("SMTP relay error: {}", e)))?
            .credentials(creds)
            .port(config.smtp_port)
            .build();

        Ok(Self { config, mailer })
    }
}

#[async_trait]
impl EmailService for SmtpEmailService {
    async fn send_verification_email(&self, to: &str, token: &str) -> Result<(), AppError> {
        let verify_url = format!(
            "{}/verifica-email?token={}",
            self.config.frontend_base_url, token
        );

        let body = format!(
            "Bun venit la PiațăRo!\n\n\
            Pentru a-ți verifica adresa de email, te rugăm să accesezi următorul link:\n\n\
            {}\n\n\
            Acest link este valabil 24 de ore.\n\n\
            Dacă nu ai creat un cont pe PiațăRo, te rugăm să ignori acest mesaj.\n\n\
            Cu respect,\n\
            Echipa PiațăRo",
            verify_url
        );

        let email =
            Message::builder()
                .from(self.config.smtp_from.parse().map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Invalid from address: {}", e))
                })?)
                .to(to.parse().map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Invalid to address: {}", e))
                })?)
                .subject("Verifică-ți adresa de email - PiațăRo")
                .header(ContentType::TEXT_PLAIN)
                .body(body)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to build email: {}", e)))?;

        self.mailer
            .send(email)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to send email: {}", e)))?;

        Ok(())
    }

    async fn send_password_reset_email(&self, to: &str, token: &str) -> Result<(), AppError> {
        let reset_url = format!(
            "{}/reseteaza-parola?token={}",
            self.config.frontend_base_url, token
        );

        let body = format!(
            "Ai solicitat resetarea parolei pentru contul tău PiațăRo.\n\n\
            Pentru a-ți reseta parola, te rugăm să accesezi următorul link:\n\n\
            {}\n\n\
            Acest link este valabil 1 oră.\n\n\
            Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest mesaj.\n\n\
            Cu respect,\n\
            Echipa PiațăRo",
            reset_url
        );

        let email =
            Message::builder()
                .from(self.config.smtp_from.parse().map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Invalid from address: {}", e))
                })?)
                .to(to.parse().map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Invalid to address: {}", e))
                })?)
                .subject("Resetează-ți parola - PiațăRo")
                .header(ContentType::TEXT_PLAIN)
                .body(body)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to build email: {}", e)))?;

        self.mailer
            .send(email)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to send email: {}", e)))?;

        Ok(())
    }
}

pub struct LogOnlyEmailService {
    config: Arc<Config>,
}

impl LogOnlyEmailService {
    pub fn new(config: Arc<Config>) -> Self {
        Self { config }
    }
}

#[async_trait]
impl EmailService for LogOnlyEmailService {
    async fn send_verification_email(&self, to: &str, token: &str) -> Result<(), AppError> {
        let verify_url = format!(
            "{}/verifica-email?token={}",
            self.config.frontend_base_url, token
        );
        tracing::info!(
            "📧 [DEV] Verification email to {}\n   Link: {}",
            to,
            verify_url
        );
        Ok(())
    }

    async fn send_password_reset_email(&self, to: &str, token: &str) -> Result<(), AppError> {
        let reset_url = format!(
            "{}/reseteaza-parola?token={}",
            self.config.frontend_base_url, token
        );
        tracing::info!(
            "📧 [DEV] Password reset email to {}\n   Link: {}",
            to,
            reset_url
        );
        Ok(())
    }
}
