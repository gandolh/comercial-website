use crate::{
    config::Config,
    dto::{
        image::{UploadUrlRequest, UploadUrlResponse},
        user::{ChangePasswordRequest, MyStatsResponse, PublicUserResponse, UpdateProfileRequest},
    },
    error::AppError,
    repositories::users::UserRepository,
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use aws_sdk_s3::presigning::PresigningConfig;
use std::{sync::Arc, time::Duration};
use uuid::Uuid;

pub struct UserService<U: UserRepository> {
    pub repo: Arc<U>,
    pub s3: aws_sdk_s3::Client,
    pub config: Arc<Config>,
}

impl<U: UserRepository> UserService<U> {
    pub fn new(repo: Arc<U>, s3: aws_sdk_s3::Client, config: Arc<Config>) -> Self {
        Self { repo, s3, config }
    }

    pub async fn update_profile(
        &self,
        user_id: Uuid,
        req: UpdateProfileRequest,
    ) -> Result<(), AppError> {
        let avatar_url = req.avatar_s3_key.map(|key| {
            format!(
                "{}/{}",
                self.config.s3_public_base_url.trim_end_matches('/'),
                key.trim_start_matches('/')
            )
        });

        self.repo
            .update_profile(user_id, req.display_name, avatar_url)
            .await
    }

    pub async fn change_password(
        &self,
        user_id: Uuid,
        req: ChangePasswordRequest,
    ) -> Result<(), AppError> {
        let user = self
            .repo
            .find_by_id(user_id)
            .await?
            .ok_or(AppError::NotFound)?;

        let parsed = PasswordHash::new(&user.password_hash)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("hash parse error: {}", e)))?;

        Argon2::default()
            .verify_password(req.current_password.as_bytes(), &parsed)
            .map_err(|_| AppError::Validation("incorrect current password".into()))?;

        let salt = SaltString::generate(&mut OsRng);
        let new_hash = Argon2::default()
            .hash_password(req.new_password.as_bytes(), &salt)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("hash error: {}", e)))?
            .to_string();

        self.repo.update_password_hash(user_id, &new_hash).await
    }

    pub async fn get_public_profile(&self, user_id: Uuid) -> Result<PublicUserResponse, AppError> {
        self.repo
            .get_public_profile(user_id)
            .await?
            .ok_or(AppError::NotFound)
    }

    pub async fn request_avatar_upload_url(
        &self,
        user_id: Uuid,
        req: UploadUrlRequest,
    ) -> Result<UploadUrlResponse, AppError> {
        // Validate content type
        match req.content_type.as_str() {
            "image/jpeg" | "image/png" | "image/webp" => {}
            _ => return Err(AppError::Validation("unsupported image type".into())),
        }

        let ext = match req.content_type.as_str() {
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            _ => "jpg",
        };

        let s3_key = format!("users/{}/avatar/{}.{}", user_id, Uuid::new_v4(), ext);

        let presigned = self
            .s3
            .put_object()
            .bucket(&self.config.aws_s3_bucket)
            .key(&s3_key)
            .content_type(req.content_type)
            .presigned(
                PresigningConfig::expires_in(Duration::from_secs(300))
                    .map_err(|e| AppError::Internal(anyhow::anyhow!(e.to_string())))?,
            )
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!(e.to_string())))?;

        let public_url = format!(
            "{}/{}",
            self.config.s3_public_base_url.trim_end_matches('/'),
            s3_key.trim_start_matches('/')
        );

        Ok(UploadUrlResponse {
            upload_url: presigned.uri().to_string(),
            s3_key,
            public_url,
        })
    }

    pub async fn get_stats(&self, user_id: Uuid) -> Result<MyStatsResponse, AppError> {
        self.repo.get_stats(user_id).await
    }
}
