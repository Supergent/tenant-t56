/**
 * Database Layer: Task Activity
 *
 * This is the ONLY file that directly accesses the taskActivity table using ctx.db.
 * All task activity-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export type TaskActivityAction =
  | "created"
  | "updated"
  | "status_changed"
  | "completed"
  | "deleted"
  | "commented";

export interface CreateTaskActivityArgs {
  taskId: Id<"tasks">;
  userId: string;
  action: TaskActivityAction;
  changes?: any;
  metadata?: any;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createTaskActivity(
  ctx: MutationCtx,
  args: CreateTaskActivityArgs
) {
  return await ctx.db.insert("taskActivity", {
    ...args,
    createdAt: Date.now(),
  });
}

/**
 * Log task created activity
 */
export async function logTaskCreated(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string,
  metadata?: any
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "created",
    metadata,
  });
}

/**
 * Log task updated activity
 */
export async function logTaskUpdated(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string,
  changes: any
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "updated",
    changes,
  });
}

/**
 * Log status change activity
 */
export async function logStatusChanged(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string,
  oldStatus: string,
  newStatus: string
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "status_changed",
    changes: { oldStatus, newStatus },
  });
}

/**
 * Log task completed activity
 */
export async function logTaskCompleted(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "completed",
  });
}

/**
 * Log task deleted activity
 */
export async function logTaskDeleted(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string,
  metadata?: any
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "deleted",
    metadata,
  });
}

/**
 * Log comment added activity
 */
export async function logTaskCommented(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  userId: string,
  commentId: Id<"taskComments">
) {
  return await createTaskActivity(ctx, {
    taskId,
    userId,
    action: "commented",
    metadata: { commentId },
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get all activity for a task (most recent first)
 */
export async function getActivityByTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskActivity")
    .withIndex("by_task_and_created", (q) => q.eq("taskId", taskId))
    .order("desc")
    .collect();
}

/**
 * Get all activity by user
 */
export async function getActivityByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskActivity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get recent activity for a user (limited)
 */
export async function getRecentActivityByUser(
  ctx: QueryCtx,
  userId: string,
  limit: number = 20
) {
  return await ctx.db
    .query("taskActivity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit);
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete all activity for a task (when task is deleted)
 */
export async function deleteActivityByTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const activities = await ctx.db
    .query("taskActivity")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  for (const activity of activities) {
    await ctx.db.delete(activity._id);
  }
}
