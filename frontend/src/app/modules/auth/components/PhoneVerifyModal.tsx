import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePhoneVerify } from "../hooks/usePhoneVerify";
import { Modal, Input, Button } from "@core/components/ui";
import { toast } from "@core/components/ui";

interface PhoneVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const PhoneVerifyModal: React.FC<PhoneVerifyModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const { request, verify } = usePhoneVerify();
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request.mutateAsync(phone);
      setStep("code");
      setResendCountdown(60);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 429) {
        toast.error(t("phoneVerify.errorRateLimit"));
      } else {
        toast.error(t("common.error"));
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verify.mutateAsync(code);
      toast.success(t("phoneVerify.success"));
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(t("phoneVerify.errorInvalidCode"));
    }
  };

  useEffect(() => {
    if (code.length === 6 && step === "code") {
      void handleVerifyCode({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [code, step]);

  const isDev = import.meta.env.DEV;

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={t("phoneVerify.title")} size="sm">
      {isDev && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-tertiary-container/30 p-3 text-sm text-on-tertiary-container">
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            info
          </span>
          <span>{t("phoneVerify.devHint")}</span>
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="mb-2 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-2xl text-primary" aria-hidden="true">
                phone
              </span>
            </div>
            <h3 className="mb-1 font-semibold text-on-surface">{t("phoneVerify.stepPhone")}</h3>
            <p className="text-sm text-on-surface-variant">{t("phoneVerify.phoneHelp")}</p>
          </div>

          <Input
            label={t("phoneVerify.phoneLabel")}
            name="phone"
            type="tel"
            placeholder={t("phoneVerify.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            data-autofocus
            fullWidth
          />

          <Button type="submit" loading={request.isPending} className="w-full">
            {t("phoneVerify.sendCode")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="mb-2 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-tertiary/10">
              <span className="material-symbols-outlined text-2xl text-tertiary" aria-hidden="true">
                smartphone
              </span>
            </div>
            <h3 className="mb-1 font-semibold text-on-surface">{t("phoneVerify.stepCode")}</h3>
            <p className="text-sm text-on-surface-variant">
              {t("phoneVerify.codeSentTo")} <span className="font-medium text-on-surface">{phone}</span>
            </p>
          </div>

          <Input
            label={t("phoneVerify.codeLabel")}
            name="code"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) setCode(val);
            }}
            required
            data-autofocus
            className="text-center font-mono text-2xl tracking-[0.5em]"
            fullWidth
          />

          <Button type="submit" loading={verify.isPending} className="w-full">
            {t("phoneVerify.verifyCode")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              resendCountdown === 0 &&
              handleRequestCode({
                preventDefault: () => {},
              } as React.FormEvent)
            }
            disabled={resendCountdown > 0 || request.isPending}
            className="w-full"
          >
            {resendCountdown > 0
              ? t("phoneVerify.resendCode", { seconds: resendCountdown })
              : t("phoneVerify.resendReady")}
          </Button>
        </form>
      )}
    </Modal>
  );
};
