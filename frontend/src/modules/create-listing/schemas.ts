import { z } from "zod";

export const CATEGORY_SLUGS = [
  "electronice",
  "auto",
  "imobiliare",
  "casa-gradina",
  "moda",
  "joburi",
  "servicii",
  "sport",
  "gratuit",
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

export const priceStepSchema = z.object({
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
export type PriceStepInput = z.infer<typeof priceStepSchema>;
export type ReviewStepInput = z.infer<typeof reviewStepSchema>;
