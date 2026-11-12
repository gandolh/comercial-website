import type { ReactNode } from "react";

interface AuthCardShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCardShell({ title, description, children }: AuthCardShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-surface-container-lowest p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-headline text-3xl font-bold text-primary">PiațăRo</h1>
            <h2 className="mb-2 text-2xl font-semibold text-on-surface">{title}</h2>
            {description && <p className="text-sm text-on-surface-variant">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
