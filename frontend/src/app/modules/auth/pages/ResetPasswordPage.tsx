import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { resetSchema, type ResetInput } from "../schemas";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";

export function ResetPasswordPage() {
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
      <AuthCardShell title="Link invalid">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">
            Link-ul de resetare este invalid sau lipsește.
          </p>
          <Link to="/parola-uitata">
            <Button>Solicită un nou link</Button>
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  if (resetMutation.isSuccess) {
    return (
      <AuthCardShell title="Parolă resetată!">
        <div className="text-center">
          <span
            className="material-symbols-outlined text-tertiary mb-4"
            style={{ fontSize: "48px" }}
          >
            check_circle
          </span>
          <p className="text-on-surface mb-2 font-medium">
            Parola ta a fost resetată cu succes!
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            Acum te poți autentifica cu noua parolă.
          </p>
          <Button onClick={() => navigate("/autentificare")}>
            Autentifică-te
          </Button>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Setează o parolă nouă"
      description="Introdu noua ta parolă"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Parolă nouă"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          autoComplete="new-password"
          fullWidth
        />

        <Input
          label="Confirmă parola nouă"
          type="password"
          {...register("passwordConfirm")}
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
          fullWidth
        />

        {resetMutation.isError && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            Link-ul a expirat sau a fost deja folosit. Te rugăm să soliciți un
            nou link de resetare.
          </div>
        )}

        <Button type="submit" loading={resetMutation.isPending} className="w-full">
          Resetează parola
        </Button>
      </form>
    </AuthCardShell>
  );
}
