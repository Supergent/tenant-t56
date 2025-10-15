/**
 * Endpoint Layer: User Preferences
 *
 * Business logic for user preferences and settings management.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import * as UserPreferences from "../db/userPreferences";
import * as validation from "../helpers/validation";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user preferences for the authenticated user
 */
export const get = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get or create preferences with defaults
    const preferences = await UserPreferences.getUserPreferences(
      ctx,
      authUser._id
    );

    // If no preferences exist, return defaults
    if (!preferences) {
      return {
        defaultView: "list" as const,
        theme: "system" as const,
        compactMode: false,
        emailNotifications: true,
        dueDateReminders: true,
        reminderHoursBefore: 24,
      };
    }

    return preferences;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update user preferences
 */
export const update = mutation({
  args: {
    defaultView: v.optional(
      v.union(v.literal("list"), v.literal("board"), v.literal("calendar"))
    ),
    defaultFilter: v.optional(v.string()),
    defaultSort: v.optional(v.string()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    compactMode: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    dueDateReminders: v.optional(v.boolean()),
    reminderHoursBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Validation
    if (args.reminderHoursBefore !== undefined) {
      if (!validation.isValidReminderHours(args.reminderHoursBefore)) {
        throw new Error("Reminder hours must be between 0 and 168 (1 week)");
      }
    }

    // Upsert preferences
    await UserPreferences.upsertUserPreferences(ctx, authUser._id, args);

    return { success: true };
  },
});
