import { describe, expect, it } from 'vitest';

import { authConfig } from '@/lib/auth/config';

// The JWT and session callbacks shape the claims that drive both client-side
// auth state AND the edge middleware's authorization decisions. A subtle bug
// here — e.g. dropping `role` from the JWT — would silently let users land on
// the wrong dashboard, so we exercise each branch explicitly.

type JwtCb = NonNullable<NonNullable<typeof authConfig.callbacks>['jwt']>;
type SessionCb = NonNullable<NonNullable<typeof authConfig.callbacks>['session']>;

const jwtCallback = authConfig.callbacks!.jwt as JwtCb;
const sessionCallback = authConfig.callbacks!.session as SessionCb;

describe('authConfig top-level', () => {
  it('uses JWT session strategy (so middleware can decode without DB)', () => {
    expect(authConfig.session?.strategy).toBe('jwt');
  });

  it('points to the project sign-in page', () => {
    expect(authConfig.pages?.signIn).toBe('/auth/signin');
    expect(authConfig.pages?.error).toBe('/auth/signin');
  });
});

describe('jwt callback', () => {
  it('projects id, role, and emailVerified onto the token when a user is present', async () => {
    const verifiedAt = new Date('2026-04-01T00:00:00Z');
    const out = await jwtCallback({
      token: {},
      // The Auth.js user shape is broader than ours; cast to any for the spec.
      user: {
        id: 'user-1',
        role: 'FOOTBALLER',
        emailVerified: verifiedAt,
      } as unknown as Parameters<JwtCb>[0]['user'],
    } as Parameters<JwtCb>[0]);

    expect(out).toMatchObject({
      id: 'user-1',
      role: 'FOOTBALLER',
      emailVerified: verifiedAt,
    });
  });

  it('coerces a missing emailVerified to null (not undefined)', async () => {
    const out = await jwtCallback({
      token: {},
      user: { id: 'user-2', role: 'CLUB' } as unknown as Parameters<JwtCb>[0]['user'],
    } as Parameters<JwtCb>[0]);

    expect(out).toMatchObject({ id: 'user-2', role: 'CLUB', emailVerified: null });
  });

  it('passes the existing token through unchanged when no user is supplied', async () => {
    // Token-refresh case: only `token` is passed, not `user`.
    const tokenIn = { id: 'user-3', role: 'ADMIN', emailVerified: null, extra: 'keep' };
    const out = await jwtCallback({ token: tokenIn } as unknown as Parameters<JwtCb>[0]);
    expect(out).toEqual(tokenIn);
  });
});

describe('session callback', () => {
  it('mirrors id, role, and emailVerified from the token to session.user', async () => {
    const verifiedAt = new Date('2026-04-01T00:00:00Z');
    const out = await sessionCallback({
      session: {
        user: { email: 'a@b.co', name: 'A' },
        expires: '2026-12-31T00:00:00Z',
      },
      token: { id: 'user-1', role: 'ADMIN', emailVerified: verifiedAt },
    } as unknown as Parameters<SessionCb>[0]);

    expect((out.user as { id: string }).id).toBe('user-1');
    expect((out.user as { role: string }).role).toBe('ADMIN');
    expect((out.user as { emailVerified: Date | null }).emailVerified).toBe(verifiedAt);
  });

  it('defaults emailVerified to null when the token does not carry it', async () => {
    const out = await sessionCallback({
      session: { user: { email: 'a@b.co' }, expires: '2026-12-31T00:00:00Z' },
      token: { id: 'user-2', role: 'CLUB' },
    } as unknown as Parameters<SessionCb>[0]);

    expect((out.user as { emailVerified: Date | null }).emailVerified).toBeNull();
  });
});
