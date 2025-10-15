/**
 * Endpoint Layer: Dashboard
 *
 * Business logic for dashboard metrics and analytics.
 * Aggregates data across multiple tables for overview.
 */

import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Tasks from "../db/tasks";
import * as Categories from "../db/categories";
import * as TaskActivity from "../db/taskActivity";
import type { DataModel } from "../_generated/dataModel";

// Tables for dynamic dashboard queries
const TABLES = ["tasks", "taskComments", "taskActivity", "userPreferences"] as const;

/**
 * Get dashboard summary with key metrics
 */
export const summary = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get all tasks for the user
    const allTasks = await Tasks.getTasksByUser(ctx, authUser._id);

    // Calculate metrics
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter((t) => t.status === "todo").length;
    const inProgressTasks = allTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "completed"
    ).length;

    // Get overdue tasks
    const overdueTasks = await Tasks.getOverdueTasks(ctx, authUser._id);

    // Get high priority tasks
    const highPriorityTasks = allTasks.filter(
      (t) => (t.priority === "high" || t.priority === "urgent") &&
        t.status !== "completed" &&
        t.status !== "archived"
    ).length;

    // Get categories count
    const categories = await Categories.getCategoriesByUser(ctx, authUser._id);
    const totalCategories = categories.length;

    // Calculate completion rate
    const activeTasksCount = allTasks.filter(
      (t) => t.status !== "archived"
    ).length;
    const completionRate =
      activeTasksCount > 0
        ? Math.round((completedTasks / activeTasksCount) * 100)
        : 0;

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = await TaskActivity.getActivityByUser(
      ctx,
      authUser._id
    );
    const recentActivityCount = recentActivity.filter(
      (a) => a.createdAt >= sevenDaysAgo
    ).length;

    // Dynamic table counts using type assertion for iteration
    const perTable: Record<string, number> = {};
    for (const table of TABLES) {
      const records = await ctx.db
        .query(table as keyof DataModel)
        .collect();
      const scopedRecords = records.filter((record: any) => {
        // Filter by userId if the field exists
        return record.userId === authUser._id;
      });
      perTable[table] = scopedRecords.length;
    }

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks: overdueTasks.length,
      highPriorityTasks,
      totalCategories,
      completionRate,
      recentActivityCount,
      perTable,
    };
  },
});

/**
 * Get recent tasks for the dashboard
 */
export const recent = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get all tasks and sort by most recent
    const tasks = await Tasks.getTasksByUser(ctx, authUser._id);

    // Return most recent 10 tasks
    return tasks.slice(0, 10);
  },
});

/**
 * Get task statistics by status
 */
export const tasksByStatus = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const allTasks = await Tasks.getTasksByUser(ctx, authUser._id);

    return {
      todo: allTasks.filter((t) => t.status === "todo").length,
      in_progress: allTasks.filter((t) => t.status === "in_progress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      archived: allTasks.filter((t) => t.status === "archived").length,
    };
  },
});

/**
 * Get task statistics by priority
 */
export const tasksByPriority = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const allTasks = await Tasks.getTasksByUser(ctx, authUser._id);

    return {
      low: allTasks.filter((t) => t.priority === "low").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      high: allTasks.filter((t) => t.priority === "high").length,
      urgent: allTasks.filter((t) => t.priority === "urgent").length,
    };
  },
});

/**
 * Get recent activity for the dashboard
 */
export const recentActivity = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get recent activity (last 20 items)
    return await TaskActivity.getRecentActivityByUser(ctx, authUser._id, 20);
  },
});
