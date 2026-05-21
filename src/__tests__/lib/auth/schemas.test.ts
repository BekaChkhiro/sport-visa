import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema, signinSchema, signupSchema } from '@/lib/auth/schemas';

const validSignup = {
  role: 'FOOTBALLER',
  firstName: 'Beka',
  lastName: 'Chkhiro',
  email: 'beka@example.com',
  password: 'sport-visa-1',
  passwordConfirm: 'sport-visa-1',
  acceptTerms: true,
};

describe('signupSchema', () => {
  it('accepts a complete, valid payload', () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  it('lowercases and trims email', () => {
    const result = signupSchema.parse({
      ...validSignup,
      email: '  BEKA@EXAMPLE.COM ',
    });
    expect(result.email).toBe('beka@example.com');
  });

  it('rejects mismatched password confirmation', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      passwordConfirm: 'sport-visa-2',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.passwordConfirm?.[0]).toBeTruthy();
    }
  });

  it('rejects a password without a digit', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'no-digit-pass',
      passwordConfirm: 'no-digit-pass',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 8 chars', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'sv-1',
      passwordConfirm: 'sv-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when terms checkbox is not accepted', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unsupported role', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      role: 'ADMIN',
    });
    expect(result.success).toBe(false);
  });
});

describe('signinSchema', () => {
  it('accepts a valid signin payload', () => {
    expect(signinSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(signinSchema.safeParse({ email: 'not-email', password: 'x' }).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(signinSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('lowercases and trims the email', () => {
    const parsed = forgotPasswordSchema.parse({ email: '  Foo@Bar.COM ' });
    expect(parsed.email).toBe('foo@bar.com');
  });
});
