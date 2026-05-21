import bcrypt from 'bcryptjs';

// 12 rounds gives ~250ms hash time on typical Railway hardware, which is
// expensive enough to deter offline cracking while keeping the signup /
// login round-trip under 500ms for the user.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
