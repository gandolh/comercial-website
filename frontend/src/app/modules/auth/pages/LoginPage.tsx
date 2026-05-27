import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { loginSchema, type LoginInput } from "../schemas";
import { useLoginMutation } from "../hooks/useLoginMutation";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthCardShell
      title="Autentifică-te"
      description="Intră în contul tău pentru a continua"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          autoComplete="email"
          fullWidth
        />

        <Input
          label="Parolă"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          autoComplete="current-password"
          fullWidth
        />

        {loginMutation.isError && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            Email sau parolă incorectă. Te rugăm să încerci din nou.
          </div>
        )}

        <Button type="submit" loading={loginMutation.isPending} className="w-full">
          Autentifică-te
        </Button>

        <div className="text-center space-y-2 mt-4">
          <Link
            to="/parola-uitata"
            className="block text-sm text-primary hover:underline"
          >
            Ai uitat parola?
          </Link>
          <p className="text-sm text-on-surface-variant">
            Nu ai cont?{" "}
            <Link
              to="/inregistrare"
              className="text-primary font-medium hover:underline"
            >
              Înregistrează-te
            </Link>
          </p>
        </div>
      </form>
    </AuthCardShell>
  );
}
