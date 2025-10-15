/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 */

// ============================================================================
// TASK VALIDATION
// ============================================================================

/**
 * Validate task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200;
}

/**
 * Validate task description
 */
export function isValidTaskDescription(description: string): boolean {
  return description.length <= 5000;
}

/**
 * Validate task priority
 */
export function isValidPriority(
  priority: string
): priority is "low" | "medium" | "high" | "urgent" {
  return ["low", "medium", "high", "urgent"].includes(priority);
}

/**
 * Validate task status
 */
export function isValidStatus(
  status: string
): status is "todo" | "in_progress" | "completed" | "archived" {
  return ["todo", "in_progress", "completed", "archived"].includes(status);
}

/**
 * Validate due date (must be in the future or today)
 */
export function isValidDueDate(dueDate: number): boolean {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  return dueDate >= oneDayAgo; // Allow dates from yesterday onwards
}

/**
 * Validate tags array
 */
export function isValidTags(tags: string[]): boolean {
  if (tags.length > 10) {
    return false; // Max 10 tags
  }
  return tags.every((tag) => tag.length > 0 && tag.length <= 30);
}

// ============================================================================
// CATEGORY VALIDATION
// ============================================================================

/**
 * Validate category name
 */
export function isValidCategoryName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate Lucide icon name (basic check)
 */
export function isValidIconName(icon: string): boolean {
  return icon.length > 0 && icon.length <= 50 && /^[a-z-]+$/i.test(icon);
}

// ============================================================================
// COMMENT VALIDATION
// ============================================================================

/**
 * Validate comment content
 */
export function isValidCommentContent(content: string): boolean {
  return content.length > 0 && content.length <= 2000;
}

// ============================================================================
// USER PREFERENCES VALIDATION
// ============================================================================

/**
 * Validate view type
 */
export function isValidViewType(
  view: string
): view is "list" | "board" | "calendar" {
  return ["list", "board", "calendar"].includes(view);
}

/**
 * Validate theme
 */
export function isValidTheme(
  theme: string
): theme is "light" | "dark" | "system" {
  return ["light", "dark", "system"].includes(theme);
}

/**
 * Validate reminder hours
 */
export function isValidReminderHours(hours: number): boolean {
  return hours >= 0 && hours <= 168; // Max 1 week (7 days * 24 hours)
}

// ============================================================================
// GENERAL VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input (remove leading/trailing whitespace)
 */
export function sanitizeInput(input: string): string {
  return input.trim();
}

/**
 * Validate order number
 */
export function isValidOrder(order: number): boolean {
  return Number.isInteger(order) && order >= 0;
}
