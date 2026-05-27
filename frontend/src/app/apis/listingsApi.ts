import { axiosInstance } from '@core/lib/axios'

export const listingsApi = {
  suggestTitles: (q: string, limit = 20) =>
    axiosInstance
      .get<string[]>('/listings/suggest', { params: { q, limit } })
      .then(r => r.data),
}
