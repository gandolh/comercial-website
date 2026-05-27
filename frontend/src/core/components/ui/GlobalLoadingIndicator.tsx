import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function GlobalLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const routerState = useRouterState();

  useEffect(() => {
    const isNavigating = routerState.status === "pending";

    if (isNavigating) {
      setIsLoading(true);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setIsLoading(false), 200);
      };
    }
  }, [routerState.status]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-surface-container-highest">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
