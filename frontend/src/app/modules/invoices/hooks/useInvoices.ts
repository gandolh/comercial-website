import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  invoicesService,
  type CreateInvoiceInput,
} from "../services/invoices.service";

export const INVOICES_KEY = ["invoices"];

export function useInvoices() {
  return useQuery({
    queryKey: INVOICES_KEY,
    queryFn: () => invoicesService.listInvoices(),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoicesService.createInvoice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
}
