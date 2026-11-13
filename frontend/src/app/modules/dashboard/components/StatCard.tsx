import { Link } from "@core/lib/router";

interface StatCardProps {
  title: string;
  value: number;
  label: string;
  icon: string;
  to: string;
  color?: "primary" | "secondary" | "error" | "info";
}

export function StatCard({ title, value, label, icon, to, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-primary bg-primary-fixed",
    error: "text-error bg-error/10",
    info: "text-info bg-info/10",
  };

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:shadow-band"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100">
          arrow_forward
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-on-surface-variant">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-on-surface">{value}</span>
          <span className="text-sm font-medium text-on-surface-variant">{label}</span>
        </div>
      </div>
    </Link>
  );
}
