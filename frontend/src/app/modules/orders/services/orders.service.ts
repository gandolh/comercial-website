import { axiosInstance } from "@core/lib/axios";

export interface Order {
  id: string;
  buyer_user_id: string;
  listing_id: string;
  seller_user_id: string;
  amount_ron: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  provider: string;
  provider_ref: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface CreateOrderResponse {
  order: Order;
  checkout_url: string | null;
  already_paid: boolean;
}

export const ordersService = {
  /**
   * Create an order for a paid listing. Returns the checkout URL to redirect to.
   * If already_paid is true, no redirect is needed.
   */
  async createOrder(
    listingId: string,
    returnUrl?: string,
    cancelUrl?: string,
  ): Promise<CreateOrderResponse> {
    const res = await axiosInstance.post<CreateOrderResponse>("/orders", {
      listing_id: listingId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });
    return res.data;
  },

  /**
   * List all orders for the authenticated buyer.
   */
  async listOrders(): Promise<Order[]> {
    const res = await axiosInstance.get<Order[]>("/orders");
    return res.data;
  },

  /**
   * Get a single order by ID.
   */
  async getOrder(orderId: string): Promise<Order> {
    const res = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return res.data;
  },

  /**
   * DEV/TEST ONLY: mark an order as paid (only works with FakePaymentProvider).
   * This is available in test mode so the full buy→pay→download flow is testable.
   */
  async markPaid(orderId: string): Promise<{ message: string; order: Order }> {
    const res = await axiosInstance.post<{ message: string; order: Order }>(
      `/orders/${orderId}/mark-paid`,
    );
    return res.data;
  },
};
