import type { ReactNode } from "react";

interface StepFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  rightSlot?: ReactNode;
}

export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continuă",
  backLabel = "Înapoi",
  isNextDisabled,
  isNextLoading,
  rightSlot,
}: StepFooterProps) {
  return (
    <div className="mt-10 pt-6 border-t border-outline/30 sticky bottom-0 bg-surface-container-low backdrop-blur">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {onBack ? (
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-full border border-outline text-on-surface-variant hover:border-primary transition-colors"
              type="button"
            >
              {backLabel}
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          {onNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isNextLoading ? (
                <span
                  className="material-symbols-outlined animate-spin"
                  style={{ fontSize: "20px" }}
                >
                  progress_activity
                </span>
              ) : null}
              {nextLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
