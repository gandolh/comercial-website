import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@core/lib/auth'
import { fetchFavoriteIds } from '../services/favorites'

export function useFavoriteIds() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['favorites', 'ids'],
    queryFn: fetchFavoriteIds,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}
