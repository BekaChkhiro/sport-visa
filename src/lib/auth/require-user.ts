import type { Role } from '@prisma/client';

import { ApiError } from '@/lib/api-error';

import { auth } from './index';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  role: Role;
  emailVerified: Date | null;
};

/**
 * Returns the current session user or throws ApiError('UNAUTHORIZED').
 *
 * Use in Route Handlers wrapped by `apiHandler` — the thrown ApiError is
 * converted into the documented JSON error envelope by the handler.
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError('UNAUTHORIZED', 'Authentication required');
  }
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: session.user.role,
    emailVerified: session.user.emailVerified ?? null,
  };
}

/** Like requireAuthenticatedUser but rejects non-admin callers with 403. */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== 'ADMIN') {
    throw new ApiError('FORBIDDEN', 'Admin role required');
  }
  return user;
}
