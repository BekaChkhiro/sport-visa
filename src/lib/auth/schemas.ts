import { z } from 'zod';

// Shared password rule: at least 8 chars, must contain a letter AND a digit.
// We deliberately don't require symbols — UX research shows it pushes users
// toward predictable substitutions ("Password1!") without increasing entropy.
const passwordSchema = z
  .string()
  .min(8, 'პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს')
  .max(72, 'პაროლი ძალიან გრძელია') // bcrypt's 72-byte hard limit
  .regex(/[A-Za-z]/, 'პაროლი უნდა შეიცავდეს ასოს')
  .regex(/[0-9]/, 'პაროლი უნდა შეიცავდეს ციფრს');

export const RoleEnum = z.enum(['FOOTBALLER', 'CLUB']);
export type SignupRole = z.infer<typeof RoleEnum>;

export const signupSchema = z
  .object({
    role: RoleEnum,
    firstName: z.string().trim().min(1, 'სახელი სავალდებულოა').max(80),
    lastName: z.string().trim().min(1, 'გვარი სავალდებულოა').max(80),
    email: z.string().trim().toLowerCase().email('სწორი ელ. ფოსტა შეიყვანე').max(254),
    password: passwordSchema,
    passwordConfirm: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'წესებზე დათანხმება სავალდებულოა',
    }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: 'პაროლები არ ემთხვევა',
    path: ['passwordConfirm'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email('სწორი ელ. ფოსტა შეიყვანე'),
  password: z.string().min(1, 'პაროლი სავალდებულოა'),
});

export type SigninInput = z.infer<typeof signinSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('სწორი ელ. ფოსტა შეიყვანე'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
