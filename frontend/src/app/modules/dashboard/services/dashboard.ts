import { axiosInstance } from '@core/lib/axios'
import type { AxiosError } from 'axios'

export interface ListingStats {
  active: number
  inactive: number
  expired: number
  expiringSoon: number
  weeklyPostCount: number
  weeklyPostLimit: number
  weekResetsAt: string
}

export interface MessagingStats {
  unreadCount: number
  conversationCount: number
}

export interface MyStatsResponse {
  listings: ListingStats
  messages: MessagingStats
  favoritesCount: number
}

interface MyStatsResponseApi {
  listings: {
    active: number
    inactive: number
    expired: number
    expiring_soon: number
    weekly_post_count: number
    weekly_post_limit: number
    week_resets_at: string
  }
  messages: {
    unread_count: number
    conversation_count: number
  }
  favorites_count: number
}

export async function fetchMyStats(): Promise<MyStatsResponse> {
  const { data } = await axiosInstance.get<MyStatsResponseApi>('/me/stats')
  
  return {
    listings: {
      active: data.listings.active,
      inactive: data.listings.inactive,
      expired: data.listings.expired,
      expiringSoon: data.listings.expiring_soon,
      weeklyPostCount: data.listings.weekly_post_count,
      weeklyPostLimit: data.listings.weekly_post_limit,
      weekResetsAt: data.listings.week_resets_at,
    },
    messages: {
      unreadCount: data.messages.unread_count,
      conversationCount: data.messages.conversation_count,
    },
    favoritesCount: data.favorites_count,
  }
}

export async function fetchMyListings(params: {
  active?: boolean;
  expired?: boolean;
  page?: number
}) {
  const { data } = await axiosInstance.get('/me/listings', { params })
  return data
}

export interface RenewListingResult {
  success: true
  retryAfterSeconds?: never
}

export interface RenewListingRateLimited {
  success: false
  retryAfterSeconds: number
}

export type RenewResult = RenewListingResult | RenewListingRateLimited

export async function renewListingDashboard(id: string): Promise<RenewResult> {
  try {
    await axiosInstance.post(`/listings/${id}/renew`)
    return { success: true }
  } catch (err) {
    const axiosErr = err as AxiosError<{ retry_after_seconds?: number }>
    if (axiosErr.response?.status === 429) {
      const retryAfterSeconds =
        axiosErr.response.data?.retry_after_seconds ?? 3600
      return { success: false, retryAfterSeconds }
    }
    throw err
  }
}
