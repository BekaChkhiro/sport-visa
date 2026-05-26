import { z } from 'zod';

export const verificationSortSchema = z.enum(['oldest', 'newest']);
export type VerificationSort = z.infer<typeof verificationSortSchema>;

export const listPendingSchema = z.object({
  query: z.string().trim().max(120).optional(),
  sort: verificationSortSchema.optional().default('oldest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});
export type ListPendingInput = z.input<typeof listPendingSchema>;

export const approveSchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
});

export const rejectSchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
  reason: z
    .string()
    .trim()
    .min(1, 'უარყოფის მიზეზი სავალდებულოა')
    .max(500, 'უარყოფის მიზეზი ძალიან გრძელია (მაქს. 500 სიმბოლო)'),
});

export type VerificationActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string };
