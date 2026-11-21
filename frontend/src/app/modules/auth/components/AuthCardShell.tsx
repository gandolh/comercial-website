import { BRAND, PAGE_TITLE } from "@core/components/brand";
import type { ReactNode } from "react";

interface AuthCardShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCardShell({ title, description, children }: AuthCardShellProps) {
  return (
    <main className="flex items-center justify-center bg-background px-4 py-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card md:p-8">
          <div className="mb-8 text-center">
            {/* The name in Cinzel (its lower case draws as small capitals), in ink: red is for actions only. */}
            <h1 className="mb-2 font-cap text-price font-bold tracking-[0.12em] text-on-surface">{BRAND.name}</h1>
            <h2 className={`${PAGE_TITLE} mb-2 text-price text-on-surface`}>{title}</h2>
            {description && <p className="text-control text-on-surface-variant">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
