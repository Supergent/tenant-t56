import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database schema for Todo List Application
 *
 * Architecture: Four-layer Convex pattern (Cleargent Pattern)
 * - All tables are user-scoped with userId
 * - Proper indexes for common query patterns
 * - Status-based workflows with literal unions
 * - Timestamps for audit trails
 */

export default defineSchema({
  // ============================================================================
  // CORE DOMAIN TABLES
  // ============================================================================

  /**
   * Tasks - Main todo items with full feature set
   */
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),

    // Organization
    categoryId: v.optional(v.id("categories")),

    // Priority & Status
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("archived")
    ),

    // Scheduling
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    // Metadata
    tags: v.optional(v.array(v.string())),
    order: v.number(), // For custom sorting within a category

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_category", ["userId", "categoryId"])
    .index("by_user_and_priority", ["userId", "priority"])
    .index("by_user_and_due_date", ["userId", "dueDate"])
    .index("by_category", ["categoryId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId", "status"],
    }),

  /**
   * Categories - Organizational containers for tasks
   */
  categories: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(), // Hex color for UI display
    icon: v.optional(v.string()), // Lucide icon name
    order: v.number(), // For custom sorting

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  /**
   * Task Comments - Activity feed for tasks
   */
  taskComments: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),
    content: v.string(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"])
    .index("by_task_and_created", ["taskId", "createdAt"]),

  /**
   * Task Activity - Audit log for task changes
   */
  taskActivity: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("status_changed"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("commented")
    ),
    changes: v.optional(v.any()), // Old/new values for updates
    metadata: v.optional(v.any()), // Additional context

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"])
    .index("by_task_and_created", ["taskId", "createdAt"]),

  // ============================================================================
  // USER PREFERENCES & SETTINGS
  // ============================================================================

  /**
   * User Preferences - Per-user settings and preferences
   */
  userPreferences: defineTable({
    userId: v.string(),

    // View preferences
    defaultView: v.union(
      v.literal("list"),
      v.literal("board"),
      v.literal("calendar")
    ),
    defaultFilter: v.optional(v.string()), // Saved filter state
    defaultSort: v.optional(v.string()),

    // UI preferences
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    compactMode: v.boolean(),

    // Notification preferences
    emailNotifications: v.boolean(),
    dueDateReminders: v.boolean(),
    reminderHoursBefore: v.number(), // Hours before due date to remind

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ============================================================================
  // AI AGENT TABLES (for @convex-dev/agent component)
  // ============================================================================

  /**
   * AI Threads - Conversation threads with AI assistant
   */
  threads: defineTable({
    userId: v.string(),
    title: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  /**
   * AI Messages - Messages within threads
   */
  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_and_created", ["threadId", "createdAt"]),
});
