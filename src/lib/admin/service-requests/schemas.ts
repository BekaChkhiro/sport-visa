import { z } from 'zod';

export const statusFilterSchema = z.enum(['ALL', 'PENDING', 'RESOLVED', 'REJECTED']);
export type StatusFilter = z.infer<typeof statusFilterSchema>;

export const listServiceRequestsSchema = z.object({
  query: z.string().trim().max(120).optional(),
  status: statusFilterSchema.optional().default('ALL'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type ListServiceRequestsInput = z.input<typeof listServiceRequestsSchema>;

export const resolveServiceRequestSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  adminNote: z.string().max(1000).optional(),
});

export const rejectServiceRequestSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  adminNote: z.string().min(1, 'მიზეზი სავალდებულოა').max(1000),
});

export type ServiceRequestActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string };
