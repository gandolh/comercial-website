mod config;
mod dto;
mod error;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod router;
mod routes;
mod services;
mod state;

use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_s3::config::Region;
use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "my_olx_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cfg = config::Config::from_env()?;
    let db = sqlx::PgPool::connect(&cfg.database_url).await?;
    sqlx::migrate!("./migrations").run(&db).await?;
    let region_provider =
        RegionProviderChain::first_try(Region::new(cfg.aws_region.clone())).or_default_provider();
    let aws_cfg = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    let s3 = aws_sdk_s3::Client::new(&aws_cfg);

    let email_service: Arc<dyn services::email::EmailService> =
        if cfg.smtp_host == "localhost" || cfg.smtp_host == "mailhog" {
            Arc::new(services::email::LogOnlyEmailService::new(Arc::new(
                cfg.clone(),
            )))
        } else {
            Arc::new(services::email::SmtpEmailService::new(Arc::new(
                cfg.clone(),
            ))?)
        };

    let phone_provider: Arc<dyn services::phone::PhoneProvider> = match cfg.phone_provider.as_str() {
        "stub" => Arc::new(services::phone::StubPhoneProvider),
        other => {
            anyhow::bail!("Unsupported phone provider: {}. Only 'stub' is supported in MVP.", other);
        }
    };

    let state = state::AppState {
        db,
        s3,
        config: Arc::new(cfg.clone()),
        email: email_service,
        phone: phone_provider,
    };

    let app = router::build(state);
    let addr = format!("{}:{}", cfg.host, cfg.port);
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
