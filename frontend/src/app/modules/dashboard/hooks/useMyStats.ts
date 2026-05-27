import { useQuery } from '@tanstack/react-query'
import { fetchMyStats } from '../services/dashboard'

export function useMyStats() {
  return useQuery({
    queryKey: ['me', 'stats'],
    queryFn: fetchMyStats,
    staleTime: 30_000,
  })
}
