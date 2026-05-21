import crypto from 'node:crypto';

import { db } from '@/lib/db';

const TTL_HOURS = 24;

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);

  // Replace any existing token for this identifier to prevent accumulation.
  await db.verificationToken.deleteMany({ where: { identifier: email } });
  await db.verificationToken.create({ data: { identifier: email, token, expires } });

  return token;
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
