import React from "react";
import { useListingMutations } from "@app/modules/listings/hooks/useListingMutations";
import { useTranslation } from "react-i18next";
import { Button } from "@core/components/ui";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface RenewButtonProps {
  listingId: string;
  expiresAt: string;
  className?: string;
}

export const RenewButton: React.FC<RenewButtonProps> = ({
  listingId,
  expiresAt,
  className = "",
}) => {
  const { t } = useTranslation();
  const { renew } = useListingMutations();

  const expiryDate = parseISO(expiresAt);
  const now = new Date();
  const daysRemaining = differenceInDays(expiryDate, now);

  if (daysRemaining > 7) return null;

  const handleRenew = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await renew.mutateAsync(listingId);
      toast.success(t("renew.success"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const isExpired = daysRemaining < 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft="refresh"
      loading={renew.isPending}
      onClick={handleRenew}
      className={`border-2 border-primary text-primary hover:bg-primary-container ${className}`}
    >
      {isExpired
        ? t("renew.expired")
        : t("renew.remaining", { days: daysRemaining })}
    </Button>
  );
};
