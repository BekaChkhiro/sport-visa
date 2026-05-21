import crypto from 'node:crypto';

import { db } from '@/lib/db';

const TTL_HOURS = 24;

// Password-reset tokens share the VerificationToken table but use a namespaced
// identifier so they never collide with email-verification tokens.
const PR_PREFIX = 'pr:';

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);

  // Replace any existing token for this identifier to prevent accumulation.
  await db.verificationToken.deleteMany({ where: { identifier: email } });
  await db.verificationToken.create({ data: { identifier: email, token, expires } });

  return token;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);
  const identifier = `${PR_PREFIX}${email}`;

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({ data: { identifier, token, expires } });

  return token;
}

export async function consumePasswordResetToken(token: string, email: string): Promise<boolean> {
  const identifier = `${PR_PREFIX}${email}`;
  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!record) return false;

  // Always delete (expired or not) so tokens are never reused.
  await db.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });

  return record.expires >= new Date();
}

export async function consumeEmailVerificationToken(
  token: string,
  email: string,
): Promise<boolean> {
  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record) {
    return false;
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return false;
  }

  await db.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return true;
}
