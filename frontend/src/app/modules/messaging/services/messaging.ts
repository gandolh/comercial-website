import { axiosInstance } from "@core/lib/axios";

export interface UserSummary {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  created_at: string;
  email?: string;
}

export interface ListingCardResponse {
  id: string;
  title: string;
  price_ron: number | null;
  city: string;
  category: string;
  cover_url: string | null;
  seller_verified: boolean;
  posted_at: string;
  active: boolean;
  expires_at: string;
}

export interface MessagePreview {
  body: string;
  sender_id: string;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  listing: ListingCardResponse;
  counterparty: UserSummary;
  last_message: MessagePreview | null;
  unread_count: number;
  last_message_at: string;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export const messagingService = {
  listConversations: async () => {
    const { data } =
      await axiosInstance.get<ConversationSummary[]>("/conversations");
    return data;
  },

  getConversation: async (id: string) => {
    const { data } = await axiosInstance.get<ConversationSummary>(
      `/conversations/${id}`,
    );
    return data;
  },

  listMessages: async (id: string, after?: string) => {
    const { data } = await axiosInstance.get<MessageResponse[]>(
      `/conversations/${id}/messages`,
      {
        params: { after },
      },
    );
    return data;
  },

  postMessage: async (id: string, body: string) => {
    const { data } = await axiosInstance.post<MessageResponse>(
      `/conversations/${id}/messages`,
      { body },
    );
    return data;
  },

  startConversation: async (listingId: string, body: string) => {
    const { data } = await axiosInstance.post<{
      conversation: ConversationSummary;
      message: MessageResponse;
    }>(`/listings/${listingId}/conversations`, { body });
    return data;
  },

  markAsRead: async (id: string) => {
    await axiosInstance.post(`/conversations/${id}/read`);
  },

  getUnreadCount: async () => {
    const { data } = await axiosInstance.get<{ count: number }>(
      "/me/unread-count",
    );
    return data.count;
  },
};
