import { axiosInstance } from "@core/lib/axios";

/** Whether the API has "Sign in with Ward" configured. */
export async function fetchWardStatus(): Promise<{ enabled: boolean }> {
  const res = await axiosInstance.get<{ enabled: boolean }>("/auth/ward/status");
  return res.data;
}

/** The API page that starts a Ward round trip; with a link ticket it links Ward to the signed-in user. */
export function wardStartUrl(linkTicket?: string): string {
  const base = (axiosInstance.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${base}/auth/ward/start${linkTicket ? `?link=${encodeURIComponent(linkTicket)}` : ""}`;
}

/** A single-use ticket for linking Ward to the signed-in user (the start page is a plain navigation). */
export async function fetchWardLinkTicket(): Promise<string> {
  const res = await axiosInstance.post<{ ticket: string }>("/auth/ward/link-ticket");
  return res.data.ticket;
}

/** What a `ward_error` code means, in Romanian. */
export function wardErrorMessage(code: string): string {
  switch (code) {
    case "not_linked":
      return "Acest cont Ward nu este legat de niciun cont PiațăRo. Intră cu parola și leagă-l din Setări.";
    case "already_linked":
      return "Acest cont Ward este deja legat de alt cont PiațăRo.";
    case "expired":
    case "expired_link":
      return "Autentificarea cu Ward a expirat. Încearcă din nou.";
    default:
      return "Autentificarea cu Ward nu a reușit. Încearcă din nou.";
  }
}
