/**
 * Endpoint Layer: Comments
 *
 * Business logic for task comment management.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as TaskComments from "../db/taskComments";
import * as Tasks from "../db/tasks";
import * as TaskActivity from "../db/taskActivity";
import * as validation from "../helpers/validation";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all comments for a task
 */
export const listByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view comments for this task");
    }

    return await TaskComments.getCommentsByTask(ctx, args.taskId);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a comment on a task
 */
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createComment", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to comment on this task");
    }

    // Validation
    const content = validation.sanitizeInput(args.content);
    if (!validation.isValidCommentContent(content)) {
      throw new Error("Comment must be between 1 and 2000 characters");
    }

    // Create comment
    const commentId = await TaskComments.createTaskComment(ctx, {
      taskId: args.taskId,
      userId: authUser._id,
      content,
    });

    // Log activity
    await TaskActivity.logTaskCommented(ctx, args.taskId, authUser._id, commentId);

    return commentId;
  },
});

/**
 * Update a comment
 */
export const update = mutation({
  args: {
    id: v.id("taskComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const comment = await TaskComments.getTaskCommentById(ctx, args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.userId !== authUser._id) {
      throw new Error("Not authorized to update this comment");
    }

    // Validation
    const content = validation.sanitizeInput(args.content);
    if (!validation.isValidCommentContent(content)) {
      throw new Error("Comment must be between 1 and 2000 characters");
    }

    // Update comment
    await TaskComments.updateTaskComment(ctx, args.id, { content });

    return args.id;
  },
});

/**
 * Delete a comment
 */
export const remove = mutation({
  args: {
    id: v.id("taskComments"),
  },
  handler: async (ctx, args) => {
    // Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteComment", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitStatus.retryAfter}ms`
      );
    }

    // Verify ownership
    const comment = await TaskComments.getTaskCommentById(ctx, args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.userId !== authUser._id) {
      throw new Error("Not authorized to delete this comment");
    }

    // Delete comment
    await TaskComments.deleteTaskComment(ctx, args.id);

    return args.id;
  },
});
