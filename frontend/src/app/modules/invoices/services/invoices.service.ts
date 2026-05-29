import { axiosInstance } from "@core/lib/axios";

export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
}

export interface InvoiceProfile {
  user_id: string;
  company_name: string | null;
  cui: string | null;
  reg_com: string | null;
  address: string | null;
  iban: string | null;
  bank_name: string | null;
  email: string | null;
  phone: string | null;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  series: string;
  number: number;
  issue_date: string;
  due_date: string | null;
  seller_name: string;
  seller_cui: string | null;
  seller_reg_com: string | null;
  seller_address: string | null;
  seller_iban: string | null;
  seller_bank: string | null;
  seller_email: string | null;
  buyer_name: string;
  buyer_cui: string | null;
  buyer_address: string | null;
  line_items: LineItem[];
  currency: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  order_id: number | null;
  created_at: string;
}

export interface CreateInvoiceInput {
  series?: string;
  issue_date: string;
  due_date?: string | null;
  seller_name: string;
  seller_cui?: string | null;
  seller_reg_com?: string | null;
  seller_address?: string | null;
  seller_iban?: string | null;
  seller_bank?: string | null;
  seller_email?: string | null;
  buyer_name: string;
  buyer_cui?: string | null;
  buyer_address?: string | null;
  line_items: LineItem[];
  currency?: string;
}

export const invoicesService = {
  async getProfile(): Promise<InvoiceProfile | null> {
    const res = await axiosInstance.get<InvoiceProfile | null>("/invoices/profile");
    return res.data;
  },

  async upsertProfile(data: Partial<InvoiceProfile>): Promise<InvoiceProfile> {
    const res = await axiosInstance.put<InvoiceProfile>("/invoices/profile", data);
    return res.data;
  },

  async listInvoices(): Promise<Invoice[]> {
    const res = await axiosInstance.get<Invoice[]>("/invoices");
    return res.data;
  },

  async createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
    const res = await axiosInstance.post<Invoice>("/invoices", data);
    return res.data;
  },

  getPdfUrl(id: string): string {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return `${base}/invoices/${id}/pdf`;
  },

  getXmlUrl(id: string): string {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return `${base}/invoices/${id}/xml`;
  },

  async downloadPdf(id: string, filename: string): Promise<void> {
    const token = localStorage.getItem("auth_token");
    const res = await axiosInstance.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  async downloadXml(id: string, filename: string): Promise<void> {
    const res = await axiosInstance.get(`/invoices/${id}/xml`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
