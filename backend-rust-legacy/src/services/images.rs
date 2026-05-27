use std::{sync::Arc, time::Duration};

use aws_sdk_s3::presigning::PresigningConfig;
use uuid::Uuid;

use crate::{
    config::Config,
    dto::image::{
        CommitImageRequest, ImageResponse, ReorderRequest, UploadUrlRequest, UploadUrlResponse,
    },
    error::AppError,
    repositories::images::{ImageRepository, ListingImageDb},
};

const MAX_IMAGES_PER_LISTING: i64 = 10;
const UPLOAD_URL_TTL_SECS: u64 = 300;

pub struct ImageService<R: ImageRepository> {
    pub repo: Arc<R>,
    pub s3: aws_sdk_s3::Client,
    pub config: Arc<Config>,
}

impl<R: ImageRepository> ImageService<R> {
    pub fn new(repo: Arc<R>, s3: aws_sdk_s3::Client, config: Arc<Config>) -> Self {
        Self { repo, s3, config }
    }

    pub async fn request_upload_url(
        &self,
        listing_id: Uuid,
        actor_id: Uuid,
        body: UploadUrlRequest,
    ) -> Result<UploadUrlResponse, AppError> {
        self.ensure_owner(listing_id, actor_id).await?;
        validate_content_type(&body.content_type)?;

        let existing_count = self.repo.count_for_listing(listing_id).await?;
        if existing_count >= MAX_IMAGES_PER_LISTING {
            return Err(AppError::RateLimit);
        }

        let ext = extension_for(&body.content_type, &body.filename)?;
        let s3_key = format!("listings/{}/{}.{}", listing_id, Uuid::new_v4(), ext);

        let presigned = self
            .s3
            .put_object()
            .bucket(&self.config.aws_s3_bucket)
            .key(&s3_key)
            .content_type(body.content_type)
            .presigned(
                PresigningConfig::expires_in(Duration::from_secs(UPLOAD_URL_TTL_SECS))
                    .map_err(|e| AppError::Internal(anyhow::anyhow!(e.to_string())))?,
            )
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!(e.to_string())))?;

        Ok(UploadUrlResponse {
            upload_url: presigned.uri().to_string(),
            s3_key: s3_key.clone(),
            public_url: public_url(&self.config, &s3_key),
        })
    }

    pub async fn commit_image(
        &self,
        listing_id: Uuid,
        actor_id: Uuid,
        body: CommitImageRequest,
    ) -> Result<ImageResponse, AppError> {
        self.ensure_owner(listing_id, actor_id).await?;

        let existing_count = self.repo.count_for_listing(listing_id).await?;
        if existing_count >= MAX_IMAGES_PER_LISTING {
            return Err(AppError::RateLimit);
        }

        let prefix = format!("listings/{listing_id}/");
        if !body.s3_key.starts_with(&prefix) {
            return Err(AppError::Validation(
                "invalid s3 key for listing".to_string(),
            ));
        }

        let image = self
            .repo
            .insert_image(
                listing_id,
                &body.s3_key,
                body.width,
                body.height,
                body.bytes,
            )
            .await?;

        Ok(to_response(image, &self.config))
    }

    pub async fn reorder_images(
        &self,
        listing_id: Uuid,
        actor_id: Uuid,
        body: ReorderRequest,
    ) -> Result<Vec<ImageResponse>, AppError> {
        self.ensure_owner(listing_id, actor_id).await?;

        let existing = self.repo.list_for_listing(listing_id).await?;
        if existing.len() != body.order.len() {
            return Err(AppError::Validation("image order length mismatch".into()));
        }

        let mut expected_ids: Vec<Uuid> = existing.iter().map(|image| image.id).collect();
        let mut got_ids = body.order.clone();
        expected_ids.sort_unstable();
        got_ids.sort_unstable();

        if expected_ids != got_ids {
            return Err(AppError::Validation(
                "image order must include every listing image id".into(),
            ));
        }

        let rows = self.repo.reorder(listing_id, &body.order).await?;
        Ok(rows
            .into_iter()
            .map(|image| to_response(image, &self.config))
            .collect())
    }

    pub async fn delete_image(
        &self,
        listing_id: Uuid,
        image_id: Uuid,
        actor_id: Uuid,
    ) -> Result<(), AppError> {
        self.ensure_owner(listing_id, actor_id).await?;

        let Some(image) = self.repo.delete_image(listing_id, image_id).await? else {
            return Err(AppError::NotFound);
        };

        let delete_result = self
            .s3
            .delete_object()
            .bucket(&self.config.aws_s3_bucket)
            .key(&image.s3_key)
            .send()
            .await;

        if let Err(err) = delete_result {
            tracing::warn!(
                listing_id = %listing_id,
                image_id = %image_id,
                s3_key = %image.s3_key,
                error = %err,
                "failed to delete image from s3"
            );
        }

        Ok(())
    }

    async fn ensure_owner(&self, listing_id: Uuid, actor_id: Uuid) -> Result<(), AppError> {
        let owner = self.repo.find_listing_owner(listing_id).await?;

        let Some(owner_id) = owner else {
            return Err(AppError::NotFound);
        };

        if owner_id != actor_id {
            return Err(AppError::Forbidden);
        }

        Ok(())
    }
}

fn validate_content_type(value: &str) -> Result<(), AppError> {
    match value {
        "image/jpeg" | "image/png" | "image/webp" => Ok(()),
        _ => Err(AppError::Validation(
            "unsupported image content_type".to_string(),
        )),
    }
}

fn extension_for(content_type: &str, filename: &str) -> Result<&'static str, AppError> {
    let from_type = match content_type {
        "image/jpeg" => Some("jpg"),
        "image/png" => Some("png"),
        "image/webp" => Some("webp"),
        _ => None,
    };

    if let Some(ext) = from_type {
        return Ok(ext);
    }

    let lowered = filename.to_lowercase();
    if lowered.ends_with(".jpg") || lowered.ends_with(".jpeg") {
        return Ok("jpg");
    }
    if lowered.ends_with(".png") {
        return Ok("png");
    }
    if lowered.ends_with(".webp") {
        return Ok("webp");
    }

    Err(AppError::Validation(
        "unsupported file extension".to_string(),
    ))
}

fn public_url(config: &Config, s3_key: &str) -> String {
    format!(
        "{}/{}",
        config.s3_public_base_url.trim_end_matches('/'),
        s3_key.trim_start_matches('/')
    )
}

fn to_response(image: ListingImageDb, config: &Config) -> ImageResponse {
    ImageResponse {
        id: image.id,
        listing_id: image.listing_id,
        url: public_url(config, &image.s3_key),
        position: image.position,
    }
}
