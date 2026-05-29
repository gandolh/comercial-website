import type { Db } from "@my-olx/core";
import type { ListingRow } from "./listings.repo.js";

export interface BundleItemRow {
  bundle_listing_id: string;
  child_listing_id: string;
  position: number;
}

export class BundlesRepository {
  constructor(private db: Db) {}

  /**
   * Replace all child items for a bundle listing (upsert via delete+insert).
   * Also sets is_bundle=1 on the parent listing.
   * @param bundleListingId - the listing that is the bundle
   * @param childIds - ordered list of child listing IDs
   */
  async setBundleItems(bundleListingId: string, childIds: string[]): Promise<void> {
    // Mark parent as bundle
    await this.db
      .updateTable("listings")
      .set({ is_bundle: 1 })
      .where("id", "=", bundleListingId)
      .execute();

    // Remove existing children
    await this.db
      .deleteFrom("bundle_items")
      .where("bundle_listing_id", "=", bundleListingId)
      .execute();

    if (childIds.length === 0) return;

    // Insert new children
    await this.db
      .insertInto("bundle_items")
      .values(
        childIds.map((childId, idx) => ({
          bundle_listing_id: bundleListingId,
          child_listing_id: childId,
          position: idx,
        }))
      )
      .execute();
  }

  /**
   * List the child listings of a bundle, ordered by position.
   * Returns full listing rows so callers can map to card responses.
   */
  async getBundleChildren(bundleListingId: string): Promise<ListingRow[]> {
    return (
      (await this.db
        .selectFrom("bundle_items")
        .innerJoin("listings", "listings.id", "bundle_items.child_listing_id")
        .selectAll("listings")
        .where("bundle_items.bundle_listing_id", "=", bundleListingId)
        .orderBy("bundle_items.position", "asc")
        .execute()) as unknown as ListingRow[]
    );
  }

  /**
   * Check whether a user has purchased a bundle that contains a given child listing.
   * Used to extend download access: a bundle buyer gains access to all children.
   */
  async hasBundlePurchaseForChild(
    userId: string,
    childListingId: string
  ): Promise<boolean> {
    const row = await this.db
      .selectFrom("bundle_items")
      .innerJoin("orders", "orders.listing_id", "bundle_items.bundle_listing_id")
      .select("orders.id")
      .where("bundle_items.child_listing_id", "=", childListingId)
      .where("orders.buyer_user_id", "=", userId)
      .where("orders.status", "=", "paid")
      .executeTakeFirst();
    return !!row;
  }
}
