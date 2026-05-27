import { useQuery } from '@tanstack/react-query'
import { fetchRelatedListings } from '../services/listings'

export function useRelatedListings(id: string) {
  return useQuery({
    queryKey: ['listing-related', id],
    queryFn: () => fetchRelatedListings(id),
    enabled: !!id,
  })
}
