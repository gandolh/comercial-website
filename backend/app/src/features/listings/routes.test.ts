import { describe, it, expect } from "vitest";
import { CreateListingRequestSchema } from "./routes.js";

describe("CreateListingRequestSchema", () => {
  it("accepts the wizard's empty, inactive draft", () => {
    const r = CreateListingRequestSchema.safeParse({
      title: "",
      description: "",
      price_ron: null,
      category: "grafica",
      active: false,
    });
    expect(r.success).toBe(true);
  });

  it("refuses a live listing with a short title or description", () => {
    expect(
      CreateListingRequestSchema.safeParse({ title: "Abc", description: "long enough text", category: "grafica" })
        .success,
    ).toBe(false);
    expect(
      CreateListingRequestSchema.safeParse({
        title: "A fine title",
        description: "short",
        category: "grafica",
        active: true,
      }).success,
    ).toBe(false);
  });

  it("accepts a complete live listing, active by default", () => {
    const r = CreateListingRequestSchema.safeParse({
      title: "A fine title",
      description: "A description long enough",
      category: "grafica",
    });
    expect(r.success && r.data.active).toBe(true);
  });

  it("still needs a category, even for a draft", () => {
    expect(
      CreateListingRequestSchema.safeParse({ title: "", description: "", category: "", active: false }).success,
    ).toBe(false);
  });
});
