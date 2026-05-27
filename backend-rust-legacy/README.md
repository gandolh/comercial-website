# PiațăRo Backend

## Database Migrations

This project uses `sqlx` for database migrations.

### Running Migrations Manually

If you have the `sqlx-cli` installed:

```bash
cargo sqlx migrate run
```

### Auto-Migrations

The backend is configured to automatically run pending migrations on startup. This is handled in `src/main.rs`:

```rust
sqlx::migrate!("./migrations").run(&db).await?;
```

### Adding New Migrations

To add a new migration, use the `sqlx-cli`:

```bash
cargo sqlx migrate add <name>
```

Or create a new `.sql` file in `migrations/` with a timestamp prefix `YYYYMMDDHHMMSS_`.

## Development

1. Ensure the infrastructure is running:
   ```bash
   cd ../infrastructure/local && docker-compose up -d
   ```
2. Run the backend:
   ```bash
   cargo run
   ```

## swagger

http://localhost:8080/swagger-ui/
