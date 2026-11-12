import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { loginSchema, type LoginInput } from "../schemas";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { fetchWardStatus, wardErrorMessage, wardStartUrl } from "../services/ward";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();
  const [searchParams] = useSearchParams();
  const wardError = searchParams.get("ward_error");
  const ward = useQuery({ queryKey: ["ward-status"], queryFn: fetchWardStatus, staleTime: 60_000 });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthCardShell title="Autentifică-te" description="PiațăRo este o demonstrație: doar proprietarul are cont.">
      {wardError && (
        <div className="mb-4 rounded-lg bg-error-container p-3 text-sm text-on-error-container">
          {wardErrorMessage(wardError)}
        </div>
      )}
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
          <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container">
            Email sau parolă incorectă. Te rugăm să încerci din nou.
          </div>
        )}

        <Button type="submit" loading={loginMutation.isPending} className="w-full">
          Autentifică-te
        </Button>

        {ward.data?.enabled && (
          <a
            href={wardStartUrl()}
            className="block w-full rounded-full border-2 border-outline-variant px-6 py-3 text-center font-semibold text-on-surface no-underline transition-colors hover:bg-surface-container-low"
          >
            Intră cu Ward
          </a>
        )}
      </form>
    </AuthCardShell>
  );
}
