import type { NextAuthConfig } from 'next-auth';

// Edge-safe slice of the Auth.js config.
//
// NextAuth v5 splits the config so middleware (which runs on the Edge runtime
// and can't use bcrypt or Prisma) can import a stripped-down auth() helper.
// Anything that touches the DB or password hashing lives in `./index.ts`
// and is only imported from Node runtime contexts (server actions, route
// handlers, server components).
export const authConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // Project a few user fields into the JWT so RSC `auth()` calls don't have
    // to hit Prisma to know the user's role / verification state.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'FOOTBALLER' | 'CLUB' | 'ADMIN';
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
