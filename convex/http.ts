import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/**
 * HTTP Router for Convex
 *
 * Handles HTTP endpoints for:
 * - Better Auth authentication (POST /auth/*)
 * - Better Auth session management (GET /auth/*)
 */
const http = httpRouter();

/**
 * Better Auth Routes
 *
 * These routes handle all authentication requests:
 * - POST /auth/sign-in - Sign in with email/password
 * - POST /auth/sign-up - Create new account
 * - POST /auth/sign-out - Sign out current session
 * - GET /auth/session - Get current session
 * - And other Better Auth endpoints
 *
 * IMPORTANT: Must use httpAction() wrapper for proper TypeScript types.
 * Without it, ctx and request won't have correct types.
 */
http.route({
  path: "/auth/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

http.route({
  path: "/auth/*",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

export default http;
