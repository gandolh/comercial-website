interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

const spacingClasses = {
  sm: 'my-3',
  md: 'my-6',
  lg: 'my-10',
}

export function Divider({ spacing = 'md', className = '' }: DividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={[
        'w-full h-px bg-surface-container-high',
        spacingClasses[spacing],
        className,
      ].join(' ')}
    />
  )
}
