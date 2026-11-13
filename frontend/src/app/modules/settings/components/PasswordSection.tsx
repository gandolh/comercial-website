import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useChangePassword } from "../hooks/useProfile";
import { Input, Button, toast } from "@core/components/ui";

/** The floor the API enforces for a new password (backend `changePasswordSchema`). */
const MIN_PASSWORD_LENGTH = 12;

/** The message for a failed change: the API answers 403 for a wrong current password and 422 for a bad body. */
function failureMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response?.status === 403) return "Parola actuală nu este corectă.";
    if (err.response?.status === 422) return `Parola nouă trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`;
  }
  return "A apărut o eroare la schimbarea parolei. Încearcă din nou.";
}

/** "Securitate": changes the local password. Every account has one (Ward links to it). */
export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const changePasswordMutation = useChangePassword();

  const submit = async () => {
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Parola nouă trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parolele noi nu coincid.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Parola a fost schimbată cu succes!");
    } catch (err: unknown) {
      setError(failureMessage(err));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  return (
    <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-sm">
      <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">
            lock
          </span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Securitate</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Schimbă parola">
        <Input
          label="Parola actuală"
          id="current_password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          fullWidth
        />

        <Input
          label="Parola nouă"
          id="new_password"
          type="password"
          autoComplete="new-password"
          hint={`Cel puțin ${MIN_PASSWORD_LENGTH} caractere.`}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
        />

        <Input
          label="Confirmă parola nouă"
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" loading={changePasswordMutation.isPending}>
            Schimbă parola
          </Button>
        </div>
      </form>
    </section>
  );
}
