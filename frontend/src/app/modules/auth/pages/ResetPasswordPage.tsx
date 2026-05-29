import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { resetSchema, type ResetInput } from "../schemas";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const resetMutation = useResetPasswordMutation();

  const onSubmit = (data: ResetInput) => {
    if (token) {
      resetMutation.mutate({ token, password: data.password });
    }
  };

  if (!token) {
    return (
      <AuthCardShell title={t("auth.resetPassword.invalidTokenTitle")}>
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">
            {t("auth.resetPassword.invalidTokenMessage")}
          </p>
          <Link to="/parola-uitata">
            <Button>{t("auth.resetPassword.requestNewLink")}</Button>
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  if (resetMutation.isSuccess) {
    return (
      <AuthCardShell title={t("auth.resetPassword.successTitle")}>
        <div className="text-center">
          <span
            className="material-symbols-outlined text-tertiary mb-4"
            style={{ fontSize: "48px" }}
          >
            check_circle
          </span>
          <p className="text-on-surface mb-2 font-medium">
            {t("auth.resetPassword.successMessage")}
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            {t("auth.resetPassword.successSubMessage")}
          </p>
          <Button onClick={() => navigate("/autentificare")}>
            {t("auth.resetPassword.loginButton")}
          </Button>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title={t("auth.resetPassword.title")}
      description={t("auth.resetPassword.description")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t("auth.resetPassword.newPasswordLabel")}
          type="password"
          {...register("password")}
          error={errors.password?.message}
          autoComplete="new-password"
          fullWidth
        />

        <Input
          label={t("auth.resetPassword.confirmPasswordLabel")}
          type="password"
          {...register("passwordConfirm")}
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
          fullWidth
        />

        {resetMutation.isError && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            {t("auth.resetPassword.errorMessage")}
          </div>
        )}

        <Button
          type="submit"
          loading={resetMutation.isPending}
          className="w-full"
        >
          {t("auth.resetPassword.submitButton")}
        </Button>
      </form>
    </AuthCardShell>
  );
}
