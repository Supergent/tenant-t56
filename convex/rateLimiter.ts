import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Rate Limiter Configuration
 *
 * Protects API endpoints from abuse with token bucket algorithm.
 * Token bucket allows bursts while maintaining average rate.
 *
 * Rate Limits:
 * - Task operations: 30 per minute (protects against spam)
 * - Category operations: 20 per minute (less frequent)
 * - Comment operations: 50 per minute (more interactive)
 * - AI chat: 10 per minute (expensive AI calls)
 * - Search: 100 per hour (prevents scraping)
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Task CRUD operations
  createTask: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  updateTask: { kind: "token bucket", rate: 50, period: MINUTE, capacity: 10 },
  deleteTask: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },

  // Category operations
  createCategory: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 3 },
  updateCategory: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  deleteCategory: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 2 },

  // Comment operations
  createComment: { kind: "token bucket", rate: 50, period: MINUTE, capacity: 10 },
  deleteComment: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },

  // AI operations (more restrictive)
  sendMessage: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 2 },
  createThread: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 1 },

  // Search operations (prevent scraping)
  searchTasks: { kind: "fixed window", rate: 100, period: HOUR },
});
