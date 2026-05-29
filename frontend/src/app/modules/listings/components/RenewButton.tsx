import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@core/components/ui";
import { Badge } from "@core/components/ui";
import { differenceInDays, differenceInMinutes, parseISO } from "date-fns";
import { toast } from "sonner";
import { renewListingDashboard } from "@app/modules/dashboard/services/dashboard";

interface RenewButtonProps {
  listingId: string;
  expiresAt: string;
  /** If true, always show (e.g. in the expired tab). Default: only show when ≤ 7 days left. */
  alwaysShow?: boolean;
  className?: string;
}

export const RenewButton: React.FC<RenewButtonProps> = ({
  listingId,
  expiresAt,
  alwaysShow = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  // retryAfterSeconds > 0 means rate-limited
  const [rateLimitSecondsLeft, setRateLimitSecondsLeft] = useState(0);

  // Countdown timer for rate-limit
  useEffect(() => {
    if (rateLimitSecondsLeft <= 0) return;
    const id = setInterval(() => {
      setRateLimitSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [rateLimitSecondsLeft]);

  const expiryDate = parseISO(expiresAt);
  const now = new Date();
  const daysRemaining = differenceInDays(expiryDate, now);

  if (!alwaysShow && daysRemaining > 7) return null;

  const isRateLimited = rateLimitSecondsLeft > 0;
  const isExpired = daysRemaining < 0;

  const handleRenew = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending || isRateLimited) return;

    setIsPending(true);
    try {
      const result = await renewListingDashboard(listingId);
      if (result.success) {
        toast.success(t("renew.success", "Anunț reînnoit pentru 30 de zile"));
        qc.invalidateQueries({ queryKey: ["me", "listings"] });
        qc.invalidateQueries({ queryKey: ["me", "stats"] });
        qc.invalidateQueries({ queryKey: ["listing", listingId] });
      } else {
        setRateLimitSecondsLeft(result.retryAfterSeconds);
        const minutesLeft = Math.ceil(result.retryAfterSeconds / 60);
        toast.warning(
          t("dashboard.renew.rateLimitedToast", {
            minutes: minutesLeft,
            defaultValue: `Poți reînnoi din nou în ${minutesLeft} minute`,
          }),
        );
      }
    } catch {
      toast.error(t("errors.generic", "A apărut o eroare. Încearcă din nou."));
    } finally {
      setIsPending(false);
    }
  };

  if (isRateLimited) {
    const minutesLeft = Math.ceil(rateLimitSecondsLeft / 60);
    return (
      <Badge variant="surface" icon="schedule" className={className}>
        {t("dashboard.renew.rateLimited", {
          minutes: minutesLeft,
          defaultValue: `Reînnoire posibilă în ${minutesLeft} min`,
        })}
      </Badge>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft="refresh"
      loading={isPending}
      onClick={handleRenew}
      className={`border-2 border-primary text-primary hover:bg-primary-container ${className}`}
    >
      {isExpired
        ? t("renew.expired", "Reactivează")
        : differenceInMinutes(expiryDate, now) < 24 * 60
          ? t("renew.expiresInHours", "Expiră astăzi — Reînnoiește")
          : t("renew.remaining", {
              days: daysRemaining,
              defaultValue: `Expiră în ${daysRemaining} zile`,
            })}
    </Button>
  );
};
