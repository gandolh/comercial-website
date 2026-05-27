import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';

export function useUnreadCount(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => messagingService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}
