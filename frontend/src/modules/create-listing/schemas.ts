import { z } from "zod";

export const CATEGORY_SLUGS = [
  "software",
  "grafica",
  "sabloane",
  "audio",
  "video",
  "ebook",
  "fonturi",
  "cod-sursa",
  "diverse",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const categoryStepSchema = z.object({
  category: z.enum(CATEGORY_SLUGS, { message: "Alege o categorie" }),
});

export const detailsStepSchema = z.object({
  title: z
    .string()
    .min(5, "Minimum 5 caractere")
    .max(200, "Maximum 200 caractere"),
  description: z
    .string()
    .min(10, "Minimum 10 caractere")
    .max(5000, "Maximum 5000 caractere"),
  isNegotiable: z.boolean(),
});

export const locationPriceStepSchema = z.object({
  city: z.string().min(1, "Selectează un oraș"),
  priceRon: z
    .number()
    .int("Prețul trebuie să fie un număr întreg")
    .positive("Preț invalid")
    .nullable()
    .optional(),
  isFree: z.boolean(),
});

export const reviewStepSchema = z.object({
  acceptsTerms: z.literal(true, {
    message: "Trebuie să confirmi că informațiile sunt corecte",
  }),
});

export type DetailsStepInput = z.infer<typeof detailsStepSchema>;
export type LocationPriceInput = z.infer<typeof locationPriceStepSchema>;
export type ReviewStepInput = z.infer<typeof reviewStepSchema>;
