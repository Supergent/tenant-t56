/**
 * Database Layer: Categories
 *
 * This is the ONLY file that directly accesses the categories table using ctx.db.
 * All category-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateCategoryArgs {
  userId: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface UpdateCategoryArgs {
  name?: string;
  color?: string;
  icon?: string;
  order?: number;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createCategory(
  ctx: MutationCtx,
  args: CreateCategoryArgs
) {
  const now = Date.now();
  return await ctx.db.insert("categories", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get category by ID
 */
export async function getCategoryById(ctx: QueryCtx, id: Id<"categories">) {
  return await ctx.db.get(id);
}

/**
 * Get all categories for a user (ordered by custom order)
 */
export async function getCategoriesByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("categories")
    .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
    .order("asc")
    .collect();
}

/**
 * Get next order value for new category
 */
export async function getNextCategoryOrder(ctx: QueryCtx, userId: string) {
  const categories = await ctx.db
    .query("categories")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  if (categories.length === 0) {
    return 0;
  }

  return Math.max(...categories.map((c) => c.order)) + 1;
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update category
 */
export async function updateCategory(
  ctx: MutationCtx,
  id: Id<"categories">,
  args: UpdateCategoryArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Bulk update category orders (for drag-and-drop reordering)
 */
export async function updateCategoryOrders(
  ctx: MutationCtx,
  updates: Array<{ id: Id<"categories">; order: number }>
) {
  const now = Date.now();
  for (const { id, order } of updates) {
    await ctx.db.patch(id, { order, updatedAt: now });
  }
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete category
 */
export async function deleteCategory(ctx: MutationCtx, id: Id<"categories">) {
  return await ctx.db.delete(id);
}
