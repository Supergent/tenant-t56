/**
 * Database Layer: User Preferences
 *
 * This is the ONLY file that directly accesses the userPreferences table using ctx.db.
 * All user preference-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export type ViewType = "list" | "board" | "calendar";
export type ThemeType = "light" | "dark" | "system";

export interface CreateUserPreferencesArgs {
  userId: string;
  defaultView?: ViewType;
  defaultFilter?: string;
  defaultSort?: string;
  theme?: ThemeType;
  compactMode?: boolean;
  emailNotifications?: boolean;
  dueDateReminders?: boolean;
  reminderHoursBefore?: number;
}

export interface UpdateUserPreferencesArgs {
  defaultView?: ViewType;
  defaultFilter?: string;
  defaultSort?: string;
  theme?: ThemeType;
  compactMode?: boolean;
  emailNotifications?: boolean;
  dueDateReminders?: boolean;
  reminderHoursBefore?: number;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createUserPreferences(
  ctx: MutationCtx,
  args: CreateUserPreferencesArgs
) {
  const now = Date.now();
  return await ctx.db.insert("userPreferences", {
    userId: args.userId,
    defaultView: args.defaultView ?? "list",
    defaultFilter: args.defaultFilter,
    defaultSort: args.defaultSort,
    theme: args.theme ?? "system",
    compactMode: args.compactMode ?? false,
    emailNotifications: args.emailNotifications ?? true,
    dueDateReminders: args.dueDateReminders ?? true,
    reminderHoursBefore: args.reminderHoursBefore ?? 24,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get user preferences by user ID
 */
export async function getUserPreferences(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/**
 * Get or create user preferences (ensures preferences always exist)
 */
export async function getOrCreateUserPreferences(
  ctx: QueryCtx | MutationCtx,
  userId: string
) {
  const existing = await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (existing) {
    return existing;
  }

  // Create with defaults (only works in mutation context)
  if ("db" in ctx) {
    const now = Date.now();
    const id = await ctx.db.insert("userPreferences", {
      userId,
      defaultView: "list",
      theme: "system",
      compactMode: false,
      emailNotifications: true,
      dueDateReminders: true,
      reminderHoursBefore: 24,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  }

  return null;
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">,
  args: UpdateUserPreferencesArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Update or create user preferences by user ID
 */
export async function upsertUserPreferences(
  ctx: MutationCtx,
  userId: string,
  args: UpdateUserPreferencesArgs
) {
  const existing = await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (existing) {
    return await updateUserPreferences(ctx, existing._id, args);
  }

  return await createUserPreferences(ctx, {
    userId,
    ...args,
  });
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete user preferences
 */
export async function deleteUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.delete(id);
}
