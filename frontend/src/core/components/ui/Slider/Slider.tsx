import { useEffect, useRef, useState } from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'

interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  debounceMs?: number
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
}: SliderProps) {
  const [local, setLocal] = useState<[number, number]>(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when parent resets value externally
  useEffect(() => {
    setLocal(value)
  }, [value[0], value[1]])

  function handleChange(v: [number, number]) {
    setLocal(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(v), debounceMs)
  }

  function handleCommit(v: [number, number]) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocal(v)
    onChange(v)
  }

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-outline">{label}</span>
          <span className="text-xs font-medium text-on-surface-variant">
            {formatValue(local[0])} – {formatValue(local[1])}
          </span>
        </div>
      )}
      <BaseSlider.Root
        value={local}
        onValueChange={(v) => handleChange(v as [number, number])}
        onValueCommitted={(v) => handleCommit(v as [number, number])}
        min={min}
        max={max}
        step={step}
        className="flex w-full touch-none select-none flex-col"
      >
        <BaseSlider.Control className="flex w-full items-center py-1">
          <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-surface-container-highest">
            <BaseSlider.Indicator className="absolute h-full rounded-full bg-primary" />
            <BaseSlider.Thumb
              className="size-4 rounded-full bg-white border-2 border-primary shadow-md hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary transition-transform cursor-grab active:cursor-grabbing"
              aria-label="Preț minim"
            />
            <BaseSlider.Thumb
              className="size-4 rounded-full bg-white border-2 border-primary shadow-md hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary transition-transform cursor-grab active:cursor-grabbing"
              aria-label="Preț maxim"
            />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    </div>
  )
}
