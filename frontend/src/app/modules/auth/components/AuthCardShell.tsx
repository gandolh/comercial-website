import type { ReactNode } from "react";

interface AuthCardShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCardShell({
  title,
  description,
  children,
}: AuthCardShellProps) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold text-primary mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              PiațăRo
            </h1>
            <h2 className="text-2xl font-semibold text-on-surface mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-on-surface-variant text-sm">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
