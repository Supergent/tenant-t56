/**
 * Database Layer: Task Comments
 *
 * This is the ONLY file that directly accesses the taskComments table using ctx.db.
 * All task comment-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTaskCommentArgs {
  taskId: Id<"tasks">;
  userId: string;
  content: string;
}

export interface UpdateTaskCommentArgs {
  content: string;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createTaskComment(
  ctx: MutationCtx,
  args: CreateTaskCommentArgs
) {
  const now = Date.now();
  return await ctx.db.insert("taskComments", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get comment by ID
 */
export async function getTaskCommentById(
  ctx: QueryCtx,
  id: Id<"taskComments">
) {
  return await ctx.db.get(id);
}

/**
 * Get all comments for a task (oldest first)
 */
export async function getCommentsByTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskComments")
    .withIndex("by_task_and_created", (q) => q.eq("taskId", taskId))
    .order("asc")
    .collect();
}

/**
 * Get all comments by user
 */
export async function getCommentsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskComments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get comment count for a task
 */
export async function getCommentCountByTask(
  ctx: QueryCtx,
  taskId: Id<"tasks">
) {
  const comments = await ctx.db
    .query("taskComments")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  return comments.length;
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update comment
 */
export async function updateTaskComment(
  ctx: MutationCtx,
  id: Id<"taskComments">,
  args: UpdateTaskCommentArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete comment
 */
export async function deleteTaskComment(
  ctx: MutationCtx,
  id: Id<"taskComments">
) {
  return await ctx.db.delete(id);
}

/**
 * Delete all comments for a task (when task is deleted)
 */
export async function deleteCommentsByTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const comments = await ctx.db
    .query("taskComments")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  for (const comment of comments) {
    await ctx.db.delete(comment._id);
  }
}
