import { axiosInstance } from "@core/lib/axios";

export interface Earnings {
  fee_rate: number;
  balance_ron: number;
  gross_ron: number;
  fees_ron: number;
  net_ron: number;
  paid_out_ron: number;
  sales_count: number;
  sales: { order_id: string; listing_id: string; title: string; amount_ron: number; fee_ron: number; net_ron: number; paid_at: string | null }[];
  payouts: { id: string; amount_ron: number; created_at: string; simulated: boolean }[];
}

export async function fetchEarnings(): Promise<Earnings> {
  const res = await axiosInstance.get<Earnings>("/me/earnings");
  return res.data;
}

/** Pays out the whole balance, simulated. `requestId` makes a retried click the same payout. */
export async function requestPayout(requestId: string): Promise<void> {
  await axiosInstance.post("/me/payouts", { request_id: requestId });
}
