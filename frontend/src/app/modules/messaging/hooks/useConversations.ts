import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingService.listConversations(),
    refetchInterval: 30000,
  });
}
