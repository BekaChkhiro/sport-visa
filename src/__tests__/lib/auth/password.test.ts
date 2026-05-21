import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('produces a hash distinct from the plaintext', async () => {
    const hash = await hashPassword('correct-horse-battery-staple-7');
    expect(hash).not.toEqual('correct-horse-battery-staple-7');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple-7');
    await expect(verifyPassword('correct-horse-battery-staple-7', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password against the hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple-7');
    await expect(verifyPassword('wrong-password-9', hash)).resolves.toBe(false);
  });

  it('produces different hashes for the same input (random salt)', async () => {
    const a = await hashPassword('matching-pass-1');
    const b = await hashPassword('matching-pass-1');
    expect(a).not.toEqual(b);
  });
});
