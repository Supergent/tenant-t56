/**
 * Endpoint Layer: Categories
 *
 * Business logic for category management.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Categories from "../db/categories";
import * as Tasks from "../db/tasks";
import * as validation from "../helpers/validation";
import { MAX_CATEGORIES_PER_USER } from "../helpers/constants";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all categories for the authenticated user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Categories.getCategoriesByUser(ctx, authUser._id);
  },
});

/**
 * Get single category by ID
 */
export const get = query({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const category = await Categories.getCategoryById(ctx, args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    if (category.userId !== authUser._id) {
      throw new Error("Not authorized to view this category");
    }

    return category;
  },
});

/**
 * Get task count for a category
 */
export const getTaskCount = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify category ownership
    const category = await Categories.getCategoryById(ctx, args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    if (category.userId !== authUser._id) {
      throw new Error("Not authorized to view this category");
    }

    const tasks = await Tasks.getTasksByCategory(ctx, args.categoryId);
    return tasks.length;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new category
 */
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createCategory", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Check category limit
    const existingCategories = await Categories.getCategoriesByUser(
      ctx,
      authUser._id
    );
    if (existingCategories.length >= MAX_CATEGORIES_PER_USER) {
      throw new Error(
        `Maximum ${MAX_CATEGORIES_PER_USER} categories allowed per user`
      );
    }

    // Validation
    const name = validation.sanitizeInput(args.name);
    if (!validation.isValidCategoryName(name)) {
      throw new Error("Category name must be between 1 and 50 characters");
    }

    if (!validation.isValidHexColor(args.color)) {
      throw new Error("Invalid color format. Must be a hex color (e.g., #FF0000)");
    }

    if (args.icon && !validation.isValidIconName(args.icon)) {
      throw new Error("Invalid icon name");
    }

    // Get next order
    const nextOrder = await Categories.getNextCategoryOrder(ctx, authUser._id);

    // Create category
    const categoryId = await Categories.createCategory(ctx, {
      userId: authUser._id,
      name,
      color: args.color,
      icon: args.icon,
      order: nextOrder,
    });

    return categoryId;
  },
});

/**
 * Update an existing category
 */
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateCategory", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify ownership
    const category = await Categories.getCategoryById(ctx, args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    if (category.userId !== authUser._id) {
      throw new Error("Not authorized to update this category");
    }

    // Validation
    if (args.name !== undefined) {
      const name = validation.sanitizeInput(args.name);
      if (!validation.isValidCategoryName(name)) {
        throw new Error("Category name must be between 1 and 50 characters");
      }
    }

    if (args.color && !validation.isValidHexColor(args.color)) {
      throw new Error("Invalid color format. Must be a hex color (e.g., #FF0000)");
    }

    if (args.icon && !validation.isValidIconName(args.icon)) {
      throw new Error("Invalid icon name");
    }

    // Update category
    const { id, ...updateArgs } = args;
    await Categories.updateCategory(ctx, id, updateArgs);

    return id;
  },
});

/**
 * Delete a category
 */
export const remove = mutation({
  args: {
    id: v.id("categories"),
    deleteMode: v.union(v.literal("unlink"), v.literal("deleteTasks")),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteCategory", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify ownership
    const category = await Categories.getCategoryById(ctx, args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    if (category.userId !== authUser._id) {
      throw new Error("Not authorized to delete this category");
    }

    // Handle tasks in this category
    const tasksInCategory = await Tasks.getTasksByCategory(ctx, args.id);

    if (args.deleteMode === "deleteTasks") {
      // Delete all tasks in this category
      await Tasks.deleteTasks(
        ctx,
        tasksInCategory.map((t) => t._id)
      );
    } else {
      // Unlink tasks from this category
      for (const task of tasksInCategory) {
        await Tasks.updateTask(ctx, task._id, { categoryId: undefined });
      }
    }

    // Delete category
    await Categories.deleteCategory(ctx, args.id);

    return args.id;
  },
});

/**
 * Reorder categories (drag and drop)
 */
export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("categories"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership of all categories
    for (const update of args.updates) {
      const category = await Categories.getCategoryById(ctx, update.id);
      if (!category) {
        throw new Error(`Category ${update.id} not found`);
      }
      if (category.userId !== authUser._id) {
        throw new Error(`Not authorized to reorder category ${update.id}`);
      }
    }

    // Update orders
    await Categories.updateCategoryOrders(ctx, args.updates);

    return { success: true };
  },
});
