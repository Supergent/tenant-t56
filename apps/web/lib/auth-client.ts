/**
 * Better Auth Client Configuration
 *
 * Client-side auth setup for the Next.js application.
 */

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  plugins: [
    convexClient(),
  ],
});

// Export auth hooks
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
