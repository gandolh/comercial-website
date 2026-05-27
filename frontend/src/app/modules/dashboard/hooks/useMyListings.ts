import { useQuery } from '@tanstack/react-query'
import { fetchMyListings } from '../services/dashboard'

export function useMyListings(params: { active?: boolean; expired?: boolean; page?: number }) {
  return useQuery({
    queryKey: ['me', 'listings', params],
    queryFn: () => fetchMyListings(params),
    staleTime: 30_000,
  })
}
