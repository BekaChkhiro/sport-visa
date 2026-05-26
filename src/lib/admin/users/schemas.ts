import { z } from 'zod';

export const userRoleFilterSchema = z.enum(['ALL', 'FOOTBALLER', 'CLUB']);
export type UserRoleFilter = z.infer<typeof userRoleFilterSchema>;

export const listUsersSchema = z.object({
  query: z.string().trim().max(120).optional(),
  role: userRoleFilterSchema.optional().default('ALL'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type ListUsersInput = z.input<typeof listUsersSchema>;

export const userIdSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export type UserActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string };
