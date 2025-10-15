import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { type DataModel } from "./_generated/dataModel";

/**
 * Better Auth Component Client
 *
 * This client is used throughout the Convex backend to:
 * - Get the authenticated user (authComponent.getAuthUser(ctx))
 * - Access Better Auth adapter for database operations
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Create Better Auth Instance
 *
 * Configuration:
 * - Email & Password authentication (no email verification required)
 * - JWT tokens with 30-day expiration
 * - Convex plugin for seamless integration
 *
 * @param ctx - Convex context (query, mutation, or action)
 * @param options - Optional configuration
 * @returns Better Auth instance
 */
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL!,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        // 30 days = 30 * 24 * 60 * 60 seconds
        jwtExpirationSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  });
};
