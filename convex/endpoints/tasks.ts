/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Tasks from "../db/tasks";
import * as TaskActivity from "../db/taskActivity";
import * as TaskComments from "../db/taskComments";
import * as validation from "../helpers/validation";
import { DEFAULT_PRIORITY, DEFAULT_STATUS } from "../helpers/constants";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all tasks for the authenticated user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * Get tasks by status
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndStatus(ctx, authUser._id, args.status);
  },
});

/**
 * Get tasks by category
 */
export const listByCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndCategory(
      ctx,
      authUser._id,
      args.categoryId
    );
  },
});

/**
 * Get tasks by priority
 */
export const listByPriority = query({
  args: {
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndPriority(
      ctx,
      authUser._id,
      args.priority
    );
  },
});

/**
 * Get tasks with due dates
 */
export const listWithDueDates = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserWithDueDates(ctx, authUser._id);
  },
});

/**
 * Get overdue tasks
 */
export const listOverdue = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getOverdueTasks(ctx, authUser._id);
  },
});

/**
 * Search tasks by title
 */
export const search = query({
  args: {
    query: v.string(),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    if (!args.query || args.query.trim().length === 0) {
      return [];
    }

    return await Tasks.searchTasks(ctx, authUser._id, args.query, args.status);
  },
});

/**
 * Get single task by ID
 */
export const get = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify ownership
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Validation
    const title = validation.sanitizeInput(args.title);
    if (!validation.isValidTaskTitle(title)) {
      throw new Error("Title must be between 1 and 200 characters");
    }

    if (args.description && !validation.isValidTaskDescription(args.description)) {
      throw new Error("Description must be less than 5000 characters");
    }

    if (args.tags && !validation.isValidTags(args.tags)) {
      throw new Error("Invalid tags: maximum 10 tags, each up to 30 characters");
    }

    if (args.dueDate && !validation.isValidDueDate(args.dueDate)) {
      throw new Error("Invalid due date");
    }

    // Get next order for this user
    const existingTasks = await Tasks.getTasksByUser(ctx, authUser._id);
    const nextOrder =
      existingTasks.length > 0
        ? Math.max(...existingTasks.map((t) => t.order)) + 1
        : 0;

    // Create task
    const taskId = await Tasks.createTask(ctx, {
      userId: authUser._id,
      title,
      description: args.description,
      categoryId: args.categoryId,
      priority: args.priority ?? DEFAULT_PRIORITY,
      status: DEFAULT_STATUS,
      dueDate: args.dueDate,
      tags: args.tags,
      order: nextOrder,
    });

    // Log activity
    await TaskActivity.logTaskCreated(ctx, taskId, authUser._id);

    return taskId;
  },
});

/**
 * Update an existing task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Validation
    if (args.title !== undefined) {
      const title = validation.sanitizeInput(args.title);
      if (!validation.isValidTaskTitle(title)) {
        throw new Error("Title must be between 1 and 200 characters");
      }
    }

    if (args.description && !validation.isValidTaskDescription(args.description)) {
      throw new Error("Description must be less than 5000 characters");
    }

    if (args.tags && !validation.isValidTags(args.tags)) {
      throw new Error("Invalid tags: maximum 10 tags, each up to 30 characters");
    }

    if (args.dueDate && !validation.isValidDueDate(args.dueDate)) {
      throw new Error("Invalid due date");
    }

    // Track changes for activity log
    const changes: any = {};
    if (args.title !== undefined) changes.title = { old: task.title, new: args.title };
    if (args.status !== undefined && args.status !== task.status) {
      changes.status = { old: task.status, new: args.status };
    }
    if (args.priority !== undefined && args.priority !== task.priority) {
      changes.priority = { old: task.priority, new: args.priority };
    }

    // Update task
    const { id, ...updateArgs } = args;
    await Tasks.updateTask(ctx, id, updateArgs);

    // Log activity
    if (args.status !== undefined && args.status !== task.status) {
      await TaskActivity.logStatusChanged(
        ctx,
        id,
        authUser._id,
        task.status,
        args.status
      );
    } else if (Object.keys(changes).length > 0) {
      await TaskActivity.logTaskUpdated(ctx, id, authUser._id, changes);
    }

    return id;
  },
});

/**
 * Complete a task
 */
export const complete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Complete task
    await Tasks.completeTask(ctx, args.id);

    // Log activity
    await TaskActivity.logTaskCompleted(ctx, args.id, authUser._id);

    return args.id;
  },
});

/**
 * Reopen a completed task
 */
export const reopen = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Reopen task
    await Tasks.reopenTask(ctx, args.id);

    // Log activity
    await TaskActivity.logStatusChanged(
      ctx,
      args.id,
      authUser._id,
      "completed",
      "todo"
    );

    return args.id;
  },
});

/**
 * Archive a task
 */
export const archive = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Archive task
    await Tasks.archiveTask(ctx, args.id);

    // Log activity
    await TaskActivity.logStatusChanged(
      ctx,
      args.id,
      authUser._id,
      task.status,
      "archived"
    );

    return args.id;
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    // Log activity before deletion
    await TaskActivity.logTaskDeleted(ctx, args.id, authUser._id, {
      title: task.title,
    });

    // Delete related data
    await TaskComments.deleteCommentsByTask(ctx, args.id);
    await TaskActivity.deleteActivityByTask(ctx, args.id);

    // Delete task
    await Tasks.deleteTask(ctx, args.id);

    return args.id;
  },
});

/**
 * Reorder tasks (drag and drop)
 */
export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("tasks"),
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

    // Verify ownership of all tasks
    for (const update of args.updates) {
      const task = await Tasks.getTaskById(ctx, update.id);
      if (!task) {
        throw new Error(`Task ${update.id} not found`);
      }
      if (task.userId !== authUser._id) {
        throw new Error(`Not authorized to reorder task ${update.id}`);
      }
    }

    // Update orders
    await Tasks.updateTaskOrders(ctx, args.updates);

    return { success: true };
  },
});
