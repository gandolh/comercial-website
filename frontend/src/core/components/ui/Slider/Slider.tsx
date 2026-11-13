import { useRef, useState } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";

interface SliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  debounceMs?: number;
  /** The label, the range and the figures on one line (the filter band). */
  inline?: boolean;
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
  debounceMs = 300,
  inline = false,
}: SliderProps) {
  const [local, setLocal] = useState<[number, number]>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when parent resets value externally: adjust during render, not in an effect.
  const [seen, setSeen] = useState(value);
  if (seen[0] !== value[0] || seen[1] !== value[1]) {
    setSeen(value);
    setLocal(value);
  }

  function handleChange(v: [number, number]) {
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), debounceMs);
  }

  function handleCommit(v: [number, number]) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocal(v);
    onChange(v);
  }

  const thumb =
    "size-5 cursor-grab rounded-full border-2 border-primary bg-surface-container-lowest shadow-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:cursor-grabbing";

  return (
    <div className={inline ? "flex flex-wrap items-center gap-x-3.5 gap-y-1" : "space-y-2"}>
      {label && (
        <span
          className={
            inline
              ? "text-control whitespace-nowrap text-on-surface-variant"
              : "block text-control text-on-surface-variant"
          }
        >
          {label}
        </span>
      )}
      <BaseSlider.Root
        value={local}
        onValueChange={(v) => handleChange(v)}
        onValueCommitted={(v) => handleCommit(v)}
        min={min}
        max={max}
        step={step}
        className={inline ? "flex w-65 touch-none flex-col select-none" : "flex w-full touch-none flex-col select-none"}
      >
        <BaseSlider.Control className="flex h-10 w-full items-center">
          <BaseSlider.Track className="relative h-1 w-full rounded-sm bg-outline-variant">
            <BaseSlider.Indicator className="absolute h-full rounded-sm bg-primary" />
            <BaseSlider.Thumb className={thumb} aria-label="Preț minim" />
            <BaseSlider.Thumb className={thumb} aria-label="Preț maxim" />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
      {label && (
        <output className="text-control font-semibold whitespace-nowrap text-on-surface">
          {formatValue(local[0])} – {formatValue(local[1])}
        </output>
      )}
    </div>
  );
}
