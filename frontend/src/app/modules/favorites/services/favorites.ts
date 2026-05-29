import { axiosInstance } from '@core/lib/axios'
import type { ListingsPage } from '@app/types/listing'
import { mapListingsPage } from '@app/modules/categories/services/listings'

interface FavoriteIdsApi {
  ids: string[]
}

interface ListingsPageApi {
  listings: Array<{
    id: string
    title: string
    price_ron: number | null
    category: string
    cover_url: string | null
    seller_verified: boolean
    posted_at: string
    active: boolean
    expires_at: string
  }>
  total_count: number
  total_pages: number
  page: number
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const response = await axiosInstance.get<FavoriteIdsApi>('/me/favorites/ids')
  return response.data.ids
}

export async function addFavorite(id: string): Promise<void> {
  await axiosInstance.post(`/favorites/${id}`)
}

export async function removeFavorite(id: string): Promise<void> {
  await axiosInstance.delete(`/favorites/${id}`)
}

export async function fetchFavoritesPage(page: number): Promise<ListingsPage> {
  const response = await axiosInstance.get<ListingsPageApi>('/me/favorites', {
    params: { page, per_page: 12 },
  })
  return mapListingsPage(response.data)
}
