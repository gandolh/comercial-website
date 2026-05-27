import { axiosInstance } from '@core/lib/axios'

export interface City {
  x: number
  y: number
  nume: string
  judet: string
  judetAuto: string
  populatie: number
  regiune: string
}

export interface CitySearchResponse {
  items: string[]
  total: number
  page: number
  limit: number
}

export const locationsApi = {
  getCounties: () =>
    axiosInstance.get<string[]>('/locations/counties').then(r => r.data),
  searchCities: (q: string, page = 1, limit = 10) =>
    axiosInstance
      .get<CitySearchResponse>('/locations/cities', { params: { q, page, limit } })
      .then(r => r.data),
}
