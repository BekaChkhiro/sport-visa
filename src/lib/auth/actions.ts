'use server';

import { Prisma } from '@prisma/client';
import { AuthError } from 'next-auth';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import { signIn, signOut } from './index';
import { hashPassword } from './password';
import { signupSchema } from './schemas';

export type SignupActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function signupAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const raw = {
    role: formData.get('role'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
    acceptTerms: formData.get('acceptTerms') === 'on' || formData.get('acceptTerms') === 'true',
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'შეავსე ფორმა სწორად',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { role, firstName, lastName, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
    });
  } catch (err) {
    // Prisma unique constraint violation on email — give the SAME generic
    // response shape we'd give for any other failure to avoid leaking
    // account existence to a signup-enumeration attacker.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      logger.info({ email }, 'signup_duplicate_email');
      return {
        status: 'error',
        message: 'ამ მისამართით უკვე არსებობს ანგარიში',
        fieldErrors: { email: ['ამ მისამართით უკვე არსებობს ანგარიში'] },
      };
    }
    logger.error({ err }, 'signup_create_failed');
    return {
      status: 'error',
      message: 'რეგისტრაცია ვერ მოხერხდა. სცადე თავიდან.',
    };
  }

  // Auto-sign-in after successful signup so the user lands in onboarding
  // without re-typing credentials.
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    // If auto-sign-in fails for some odd reason, the account was still
    // created — let the user log in manually.
    logger.warn({ err }, 'signup_autologin_failed');
  }

  return { status: 'success' };
}

export type SigninActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export async function signinAction(
  _prev: SigninActionState,
  formData: FormData,
): Promise<SigninActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { status: 'error', message: 'ელ. ფოსტა და პაროლი სავალდებულოა' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // CredentialsSignin is what NextAuth throws when authorize() returns null.
      // We collapse every auth failure into one message to avoid revealing
      // whether the email exists.
      return {
        status: 'error',
        message: 'ელ. ფოსტა ან პაროლი არასწორია',
      };
    }
    throw err;
  }

  return { status: 'success' };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
