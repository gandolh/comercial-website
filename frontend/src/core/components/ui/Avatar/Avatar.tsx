type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const base = [
    'rounded-full overflow-hidden flex items-center justify-center shrink-0 select-none',
    sizeClasses[size],
    className,
  ].join(' ')

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar utilizator'}
        className={`${base} object-cover`}
      />
    )
  }

  return (
    <div
      className={`${base} bg-primary-fixed text-on-primary-fixed font-semibold`}
      aria-label={name ? `Avatar pentru ${name}` : 'Avatar utilizator'}
    >
      {name ? getInitials(name) : (
        <span className="material-symbols-outlined" aria-hidden="true">person</span>
      )}
    </div>
  )
}
