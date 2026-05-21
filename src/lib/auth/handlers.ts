import { handlers } from './index';

// Re-export the NextAuth route handlers from a separate file so the
// app/api/auth/[...nextauth]/route.ts file stays single-purpose.
export const { GET, POST } = handlers;
