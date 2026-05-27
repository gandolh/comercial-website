use sqlx::PgPool;
use std::env;

#[tokio::test]
async fn test_migrations_apply() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set for integration tests");
    let pool = PgPool::connect(&database_url).await.expect("Failed to connect to Postgres");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to apply migrations");

    // Assert tables exist
    let tables = vec![
        "users",
        "email_verification_tokens",
        "password_reset_tokens",
        "phone_verification_codes",
        "listings",
        "listing_images",
        "favorites",
        "conversations",
        "messages",
    ];

    for table in tables {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)"
        )
        .bind(table)
        .fetch_one(&pool)
        .await
        .expect(&format!("Failed to check if table {} exists", table));

        assert!(exists.0, "Table {} does not exist after migrations", table);
    }

    // Verify extensions
    let extensions = vec!["unaccent", "pg_trgm", "pgcrypto"];
    for ext in extensions {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS (SELECT FROM pg_extension WHERE extname = $1)"
        )
        .bind(ext)
        .fetch_one(&pool)
        .await
        .expect(&format!("Failed to check if extension {} exists", ext));

        assert!(exists.0, "Extension {} does not exist after migrations", ext);
    }
}
