import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@core/lib/auth'
import { fetchFavoritesPage } from '../services/favorites'

export function useFavoritesPage(page: number) {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['favorites', 'page', page],
    queryFn: () => fetchFavoritesPage(page),
    enabled: isAuthenticated,
  })
}
