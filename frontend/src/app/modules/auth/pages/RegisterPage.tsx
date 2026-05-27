import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@core/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { Input, Button } from "@core/components/ui";
import { registerSchema, type RegisterInput } from "../schemas";
import { useRegisterMutation } from "../hooks/useRegisterMutation";

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate({ email: data.email, password: data.password });
  };

  return (
    <AuthCardShell
      title="Creează un cont"
      description="Înregistrează-te pentru a posta anunțuri"
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
          autoComplete="new-password"
          fullWidth
        />

        <Input
          label="Confirmă parola"
          type="password"
          {...register("passwordConfirm")}
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
          fullWidth
        />

        {registerMutation.isError && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            Acest email este deja înregistrat sau a apărut o eroare.
          </div>
        )}

        {registerMutation.isSuccess && (
          <div className="p-3 rounded-lg bg-tertiary-container text-on-tertiary-container text-sm">
            Cont creat cu succes! Verifică-ți emailul pentru a-ți activa contul.
          </div>
        )}

        <Button type="submit" loading={registerMutation.isPending} className="w-full">
          Înregistrează-te
        </Button>

        <p className="text-center text-sm text-on-surface-variant mt-4">
          Ai deja cont?{" "}
          <Link
            to="/autentificare"
            className="text-primary font-medium hover:underline"
          >
            Autentifică-te
          </Link>
        </p>
      </form>
    </AuthCardShell>
  );
}
