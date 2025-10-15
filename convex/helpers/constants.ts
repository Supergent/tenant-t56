/**
 * Application Constants
 *
 * Shared constants used throughout the application.
 */

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION_LIMIT = 50;
export const MAX_SEARCH_RESULTS = 100;

// ============================================================================
// TASK CONSTANTS
// ============================================================================

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "completed",
  "archived",
] as const;

export const PRIORITY_LABELS: Record<
  (typeof TASK_PRIORITIES)[number],
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<
  (typeof TASK_PRIORITIES)[number],
  string
> = {
  low: "#6b7280", // gray-500
  medium: "#3b82f6", // blue-500
  high: "#f59e0b", // amber-500
  urgent: "#ef4444", // red-500
};

export const STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export const STATUS_COLORS: Record<(typeof TASK_STATUSES)[number], string> = {
  todo: "#6b7280", // gray-500
  in_progress: "#3b82f6", // blue-500
  completed: "#16a34a", // green-600
  archived: "#9ca3af", // gray-400
};

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_CATEGORY_NAME_LENGTH = 50;
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS_PER_TASK = 10;
export const MAX_CATEGORIES_PER_USER = 50;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PRIORITY = "medium";
export const DEFAULT_STATUS = "todo";
export const DEFAULT_VIEW = "list";
export const DEFAULT_THEME = "system";
export const DEFAULT_REMINDER_HOURS = 24;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// ACTIVITY ACTIONS
// ============================================================================

export const ACTIVITY_ACTIONS = [
  "created",
  "updated",
  "status_changed",
  "completed",
  "deleted",
  "commented",
] as const;

export const ACTIVITY_LABELS: Record<
  (typeof ACTIVITY_ACTIONS)[number],
  string
> = {
  created: "Created task",
  updated: "Updated task",
  status_changed: "Changed status",
  completed: "Completed task",
  deleted: "Deleted task",
  commented: "Added comment",
};

// ============================================================================
// VIEW TYPES
// ============================================================================

export const VIEW_TYPES = ["list", "board", "calendar"] as const;

export const VIEW_LABELS: Record<(typeof VIEW_TYPES)[number], string> = {
  list: "List View",
  board: "Board View",
  calendar: "Calendar View",
};

// ============================================================================
// THEME TYPES
// ============================================================================

export const THEME_TYPES = ["light", "dark", "system"] as const;

export const THEME_LABELS: Record<(typeof THEME_TYPES)[number], string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

// ============================================================================
// DEFAULT CATEGORY COLORS
// ============================================================================

export const DEFAULT_CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

// ============================================================================
// DEFAULT CATEGORY ICONS (Lucide icons)
// ============================================================================

export const DEFAULT_CATEGORY_ICONS = [
  "folder",
  "briefcase",
  "home",
  "heart",
  "star",
  "flag",
  "bookmark",
  "tag",
  "inbox",
  "archive",
  "clipboard",
  "calendar",
  "target",
  "zap",
  "trophy",
];
