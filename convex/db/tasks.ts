/**
 * Database Layer: Tasks
 *
 * This is the ONLY file that directly accesses the tasks table using ctx.db.
 * All task-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "completed" | "archived";

export interface CreateTaskArgs {
  userId: string;
  title: string;
  description?: string;
  categoryId?: Id<"categories">;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: number;
  tags?: string[];
  order: number;
}

export interface UpdateTaskArgs {
  title?: string;
  description?: string;
  categoryId?: Id<"categories">;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: number;
  completedAt?: number;
  tags?: string[];
  order?: number;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createTask(ctx: MutationCtx, args: CreateTaskArgs) {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get task by ID
 */
export async function getTaskById(ctx: QueryCtx, id: Id<"tasks">) {
  return await ctx.db.get(id);
}

/**
 * Get all tasks for a user (most recent first)
 */
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get tasks by user and status
 */
export async function getTasksByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: TaskStatus
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

/**
 * Get tasks by user and category
 */
export async function getTasksByUserAndCategory(
  ctx: QueryCtx,
  userId: string,
  categoryId: Id<"categories">
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_category", (q) =>
      q.eq("userId", userId).eq("categoryId", categoryId)
    )
    .order("desc")
    .collect();
}

/**
 * Get tasks by user and priority
 */
export async function getTasksByUserAndPriority(
  ctx: QueryCtx,
  userId: string,
  priority: TaskPriority
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_priority", (q) =>
      q.eq("userId", userId).eq("priority", priority)
    )
    .order("desc")
    .collect();
}

/**
 * Get tasks by user with due dates
 */
export async function getTasksByUserWithDueDates(
  ctx: QueryCtx,
  userId: string
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_due_date", (q) => q.eq("userId", userId))
    .order("asc")
    .collect();
}

/**
 * Get overdue tasks for a user
 */
export async function getOverdueTasks(ctx: QueryCtx, userId: string) {
  const now = Date.now();
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user_and_due_date", (q) => q.eq("userId", userId))
    .collect();

  return tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < now &&
      task.status !== "completed" &&
      task.status !== "archived"
  );
}

/**
 * Search tasks by title
 */
export async function searchTasks(
  ctx: QueryCtx,
  userId: string,
  searchQuery: string,
  status?: TaskStatus
) {
  return await ctx.db
    .query("tasks")
    .withSearchIndex("search_title", (q) => {
      let search = q.search("title", searchQuery).eq("userId", userId);
      if (status) {
        search = search.eq("status", status);
      }
      return search;
    })
    .collect();
}

/**
 * Get tasks by category (for category deletion check)
 */
export async function getTasksByCategory(
  ctx: QueryCtx,
  categoryId: Id<"categories">
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
    .collect();
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update task
 */
export async function updateTask(
  ctx: MutationCtx,
  id: Id<"tasks">,
  args: UpdateTaskArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Mark task as completed
 */
export async function completeTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.patch(id, {
    status: "completed",
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Reopen completed task
 */
export async function reopenTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.patch(id, {
    status: "todo",
    completedAt: undefined,
    updatedAt: Date.now(),
  });
}

/**
 * Archive task
 */
export async function archiveTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.patch(id, {
    status: "archived",
    updatedAt: Date.now(),
  });
}

/**
 * Bulk update task orders (for drag-and-drop reordering)
 */
export async function updateTaskOrders(
  ctx: MutationCtx,
  updates: Array<{ id: Id<"tasks">; order: number }>
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
 * Delete task
 */
export async function deleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.delete(id);
}

/**
 * Bulk delete tasks (e.g., when deleting a category)
 */
export async function deleteTasks(ctx: MutationCtx, ids: Id<"tasks">[]) {
  for (const id of ids) {
    await ctx.db.delete(id);
  }
}
