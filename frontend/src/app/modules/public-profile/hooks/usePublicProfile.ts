import { useQuery } from "@tanstack/react-query";
import { getPublicProfile, getUserListings } from "../services/profile";

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => getPublicProfile(userId),
    enabled: !!userId,
  });
}

export function useUserListings(userId: string, page = 1) {
  return useQuery({
    queryKey: ["user-listings", userId, page],
    queryFn: () => getUserListings(userId, { page, per_page: 12 }),
    enabled: !!userId,
  });
}
