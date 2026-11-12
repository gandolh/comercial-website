interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, showLabel = false, className = "" }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showLabel) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-on-surface-variant">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-on-surface-variant">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
      >
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
