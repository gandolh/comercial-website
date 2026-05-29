import { axiosInstance } from "@core/lib/axios";
import type { ListingDetail } from "@app/types/listing";
import { fetchListingDetail } from "@app/modules/listings/services/listings";

interface ListingRecordApi {
  id: string;
}

export type ListingDraft = ListingDetail;

export type UpdateDraftPayload = Partial<{
  title: string;
  description: string;
  price_ron: number | null;
  category: string;
  active: boolean;
}>;

async function refreshDraft(id: string): Promise<ListingDraft> {
  return fetchListingDetail(id);
}

export async function createDraft(category: string): Promise<ListingDraft> {
  const response = await axiosInstance.post<ListingRecordApi>("/listings", {
    title: "",
    description: "",
    price_ron: null,
    category,
    active: false,
  });

  return refreshDraft(response.data.id);
}

export async function updateDraft(
  id: string,
  payload: UpdateDraftPayload,
): Promise<ListingDraft> {
  await axiosInstance.patch(`/listings/${id}`, payload);
  return refreshDraft(id);
}

export async function publishDraft(id: string): Promise<ListingDraft> {
  await axiosInstance.post(`/listings/${id}/publish`);
  return refreshDraft(id);
}

export async function fetchDraft(id: string): Promise<ListingDraft> {
  return refreshDraft(id);
}
