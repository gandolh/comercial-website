export function formatPrice(ron: number): string {
  return new Intl.NumberFormat('ro-RO').format(ron) + ' RON'
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
