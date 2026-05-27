import { Link } from "@core/lib/router";

interface StatCardProps {
  title: string;
  value: number;
  label: string;
  icon: string;
  to: string;
  color?: "primary" | "secondary" | "error" | "info";
}

export function StatCard({
  title,
  value,
  label,
  icon,
  to,
  color = "primary",
}: StatCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    error: "text-error bg-error/10",
    info: "text-info bg-info/10",
  };

  return (
    <Link
      to={to}
      className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:shadow-lg transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
          arrow_forward
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-on-surface">{value}</span>
          <span className="text-on-surface-variant text-sm font-medium">
            {label}
          </span>
        </div>
      </div>
    </Link>
  );
}
