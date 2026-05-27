import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Textarea, Button } from "@core/components/ui";
import { messagingService } from "../services/messaging";
import { useNavigate } from "@core/lib/router";

interface Props {
  listingId: string;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSellerModal: React.FC<Props> = ({
  listingId,
  sellerName,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      const { conversation } = await messagingService.startConversation(
        listingId,
        message,
      );
      onClose();
      navigate(`/mesaje/${conversation.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t("common:errors.generic"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("common:messaging.contact_seller_title", { name: sellerName })}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          autoFocus
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("common:messaging.contact_placeholder")}
          disabled={isSending}
          fullWidth
          rows={4}
        />

        {error && <p className="text-error text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSending}
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={!message.trim()}
            loading={isSending}
          >
            {t("common:actions.send")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
