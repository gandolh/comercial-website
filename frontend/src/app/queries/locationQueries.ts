import { queryOptions } from '@tanstack/react-query'
import { locationsApi } from '@app/apis/locationsApi'

export const locationQueries = {
  counties: () =>
    queryOptions({
      queryKey: ['locations', 'counties'],
      queryFn: locationsApi.getCounties,
      staleTime: Infinity,
    }),
  cities: (q: string) =>
    queryOptions({
      queryKey: ['locations', 'cities', q],
      queryFn: () => locationsApi.searchCities(q),
      staleTime: 5 * 60 * 1000,
    }),
}
