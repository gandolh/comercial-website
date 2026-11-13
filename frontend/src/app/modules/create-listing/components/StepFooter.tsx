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
    <div className="sticky bottom-0 mt-10 border-t border-outline/30 bg-surface-container-low pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {onBack ? (
            <button
              onClick={onBack}
              className="rounded-full border border-outline px-5 py-2.5 text-on-surface-variant transition-colors hover:border-primary"
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
              className="flex items-center gap-2 rounded-control bg-primary px-6 py-2.5 font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isNextLoading ? (
                <span className="material-symbols-outlined motion-safe:animate-spin" style={{ fontSize: "20px" }}>
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
