import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesService, type InvoiceProfile } from "../services/invoices.service";

export const INVOICE_PROFILE_KEY = ["invoice-profile"];

export function useInvoiceProfile() {
  return useQuery({
    queryKey: INVOICE_PROFILE_KEY,
    queryFn: () => invoicesService.getProfile(),
  });
}

export function useUpsertInvoiceProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InvoiceProfile>) => invoicesService.upsertProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_PROFILE_KEY }),
  });
}
