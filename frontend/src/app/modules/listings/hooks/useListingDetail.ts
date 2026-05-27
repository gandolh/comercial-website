import { useQuery } from "@tanstack/react-query";
import { fetchListingDetail } from "../services/listings";

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingDetail(id),
    enabled: !!id,
  });
}
