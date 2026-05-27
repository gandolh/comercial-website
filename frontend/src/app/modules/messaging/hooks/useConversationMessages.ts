import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/messaging';

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId, 'messages'],
    queryFn: () => messagingService.listMessages(conversationId),
    refetchInterval: 12000,
    refetchIntervalInBackground: false,
    enabled: !!conversationId,
  });
}
