/**
 * Database Layer: Messages (AI Chat)
 *
 * This is the ONLY file that directly accesses the messages table using ctx.db.
 * All message-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

export type MessageRole = "user" | "assistant";

export interface CreateMessageArgs {
  threadId: Id<"threads">;
  userId: string;
  role: MessageRole;
  content: string;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createMessage(
  ctx: MutationCtx,
  args: CreateMessageArgs
) {
  return await ctx.db.insert("messages", {
    ...args,
    createdAt: Date.now(),
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get message by ID
 */
export async function getMessageById(ctx: QueryCtx, id: Id<"messages">) {
  return await ctx.db.get(id);
}

/**
 * Get all messages for a thread (oldest first)
 */
export async function getMessagesByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">
) {
  return await ctx.db
    .query("messages")
    .withIndex("by_thread_and_created", (q) => q.eq("threadId", threadId))
    .order("asc")
    .collect();
}

/**
 * Get recent messages for a thread (limited)
 */
export async function getRecentMessagesByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">,
  limit: number = 50
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread_and_created", (q) => q.eq("threadId", threadId))
    .order("asc")
    .collect();

  // Return last N messages
  return messages.slice(-limit);
}

/**
 * Get message count for a thread
 */
export async function getMessageCountByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .collect();

  return messages.length;
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete message
 */
export async function deleteMessage(ctx: MutationCtx, id: Id<"messages">) {
  return await ctx.db.delete(id);
}

/**
 * Delete all messages for a thread (when thread is deleted)
 */
export async function deleteMessagesByThread(
  ctx: MutationCtx,
  threadId: Id<"threads">
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .collect();

  for (const message of messages) {
    await ctx.db.delete(message._id);
  }
}
