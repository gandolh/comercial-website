import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { forgotSchema, type ForgotInput } from "../schemas";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const forgotMutation = useForgotPasswordMutation();

  const onSubmit = (data: ForgotInput) => {
    forgotMutation.mutate(data.email);
  };

  return (
    <AuthCardShell
      title={t("auth.forgotPassword.title")}
      description={t("auth.forgotPassword.description")}
    >
      {forgotMutation.isSuccess ? (
        <div className="text-center">
          <span
            className="material-symbols-outlined text-tertiary mb-4"
            style={{ fontSize: "48px" }}
          >
            mark_email_read
          </span>
          <p className="text-on-surface mb-2 font-medium">
            {t("auth.forgotPassword.successTitle")}
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            {t("auth.forgotPassword.successMessage")}
          </p>
          <Link to="/autentificare">
            <Button className="w-full">
              {t("auth.forgotPassword.backToLogin")}
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("auth.forgotPassword.emailLabel")}
            type="email"
            {...register("email")}
            error={errors.email?.message}
            autoComplete="email"
            fullWidth
          />

          {forgotMutation.isError && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
              {t("auth.forgotPassword.errorMessage")}
            </div>
          )}

          <Button
            type="submit"
            loading={forgotMutation.isPending}
            className="w-full"
          >
            {t("auth.forgotPassword.submitButton")}
          </Button>

          <p className="text-center text-sm text-on-surface-variant mt-4">
            {t("auth.forgotPassword.rememberPassword")}{" "}
            <Link
              to="/autentificare"
              className="text-primary font-medium hover:underline"
            >
              {t("auth.forgotPassword.loginLink")}
            </Link>
          </p>
        </form>
      )}
    </AuthCardShell>
  );
}
