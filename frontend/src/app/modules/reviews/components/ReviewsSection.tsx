import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { AxiosError } from "axios";
import { useReviews, useSubmitReview, useDeleteReview } from "../hooks/useReviews";
import type { Review } from "../types/index";
import { Button } from "@core/components/ui/Button/Button";
import { Textarea } from "@core/components/ui/Textarea/Textarea";
import { Radio, RadioGroup } from "@core/components/ui";

// ─── Star display/picker ──────────────────────────────────────────────────────

interface StarRatingProps {
  value: number;
  /** If true, stars are interactive (picker mode). */
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

function StarRating({ value, interactive = false, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const iconSize = size === "sm" ? "text-[16px]" : "text-[24px]";

  const star = (n: number, filled: boolean) => (
    <span
      className={[
        "material-symbols-outlined",
        iconSize,
        filled ? "text-rating" : "text-outline-variant",
        interactive ? "transition-colors group-hover:text-rating" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      aria-hidden={interactive ? true : undefined}
      aria-label={interactive ? undefined : `${n} stele`}
    >
      star
    </span>
  );

  if (!interactive) {
    return <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((n) => star(n, value >= n))}</div>;
  }

  return (
    <RadioGroup
      aria-label="Rating"
      value={value === 0 ? null : String(value)}
      onValueChange={(next) => onChange?.(Number(next))}
      className="flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Radio
          key={n}
          value={String(n)}
          aria-label={`${n} stele`}
          className="group flex rounded-sm"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          {star(n, (hovered || value) >= n)}
        </Radio>
      ))}
    </RadioGroup>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const { t } = useTranslation();
  const name = review.buyer_display_name ?? t("reviews.anonymousBuyer");
  const dateStr = format(new Date(review.created_at), "d MMM yyyy", { locale: ro });

  return (
    <article className="space-y-2 rounded-xl border border-surface-container-high bg-surface-container-lowest px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary"
            aria-hidden="true"
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">{name}</p>
            <p className="text-xs text-on-surface-variant">{dateStr}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>
      {review.body && <p className="text-sm leading-relaxed text-on-surface-variant">{review.body}</p>}
    </article>
  );
}

// ─── Aggregate summary strip ──────────────────────────────────────────────────

interface AggregateSummaryProps {
  ratingAvg: number | null;
  ratingCount: number;
}

function AggregateSummary({ ratingAvg, ratingCount }: AggregateSummaryProps) {
  const { t } = useTranslation();

  if (ratingCount === 0) {
    return <p className="text-sm text-on-surface-variant">{t("reviews.noReviewsYet")}</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-extrabold text-on-surface" aria-label={`${ratingAvg?.toFixed(1)} din 5`}>
        {ratingAvg?.toFixed(1)}
      </span>
      <div className="space-y-1">
        <StarRating value={Math.round(ratingAvg ?? 0)} />
        <p className="text-xs text-on-surface-variant">{t("reviews.reviewCount", { count: ratingCount })}</p>
      </div>
    </div>
  );
}

// ─── Review form ──────────────────────────────────────────────────────────────

interface ReviewFormProps {
  listingId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

function ReviewForm({ listingId, existingReview, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [error, setError] = useState<string | null>(null);

  const submitMutation = useSubmitReview(listingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t("reviews.form.ratingRequired"));
      return;
    }
    setError(null);

    try {
      await submitMutation.mutateAsync({ rating, body: body.trim() || null });
      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const msg: string = axiosErr?.response?.data?.error ?? t("reviews.form.submitError");
      setError(msg);
    }
  };

  const isEditing = !!existingReview;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-on-surface-variant">{t("reviews.form.ratingLabel")}</p>
        <StarRating value={rating} interactive onChange={setRating} />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <Textarea
        label={t("reviews.form.bodyLabel")}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={t("reviews.form.bodyPlaceholder")}
        fullWidth
      />

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="sm" loading={submitMutation.isPending}>
          {isEditing ? t("reviews.form.update") : t("reviews.form.submit")}
        </Button>
      </div>
    </form>
  );
}

// ─── Main ReviewsSection ──────────────────────────────────────────────────────

interface ReviewsSectionProps {
  listingId: string;
  /** True when the authenticated user has a paid order for this listing. */
  canReview: boolean;
}

export function ReviewsSection({ listingId, canReview }: ReviewsSectionProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useReviews(listingId);
  const deleteMutation = useDeleteReview(listingId);
  const [showForm, setShowForm] = useState(false);

  // The user's own review (null until loaded)
  const myReview = data?.reviews.find((r) => r.buyer_user_id !== undefined && canReview) ?? null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setShowForm(false);
    } catch {
      // silent
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="reviews-heading">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 id="reviews-heading" className="font-headline text-lg font-bold text-on-surface">
          {t("reviews.title")}
        </h2>
      </div>

      {/* Aggregate summary */}
      {isLoading ? (
        <div className="h-10 rounded-xl bg-surface-container motion-safe:animate-pulse" />
      ) : (
        <AggregateSummary ratingAvg={data?.rating_avg ?? null} ratingCount={data?.rating_count ?? 0} />
      )}

      {/* Buyer review form / CTA */}
      {canReview && (
        <div className="space-y-4 rounded-xl bg-surface-container p-5">
          {myReview && !showForm ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-on-surface">{t("reviews.yourReview")}</p>
              <ReviewCard review={myReview} />
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} iconLeft="edit">
                  {t("reviews.form.edit")}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                  iconLeft="delete"
                >
                  {t("reviews.form.delete")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-on-surface">
                {myReview ? t("reviews.form.editHeading") : t("reviews.form.heading")}
              </p>
              <ReviewForm listingId={listingId} existingReview={myReview} onSuccess={() => setShowForm(false)} />
              {myReview && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {t("reviews.form.cancelEdit")}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-container motion-safe:animate-pulse" />
          ))}
        </div>
      ) : !data || data.reviews.length === 0 ? (
        <p className="py-4 text-sm text-on-surface-variant">{t("reviews.noReviewsYet")}</p>
      ) : (
        <ul className="space-y-3" aria-label={t("reviews.title")}>
          {data.reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
