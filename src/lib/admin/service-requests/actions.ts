'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import {
  listServiceRequestsSchema,
  resolveServiceRequestSchema,
  rejectServiceRequestSchema,
  type ListServiceRequestsInput,
  type ServiceRequestActionState,
} from './schemas';

export type ServiceRequestRow = {
  id: string;
  requestCode: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  categoryName: string;
  userEmail: string | null;
  footballerName: string | null;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

export type ServiceRequestsPage = {
  items: ServiceRequestRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

async function ensureAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  if (session.user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return session.user.id;
}

function revalidateServiceRequestPages() {
  revalidatePath('/admin');
  revalidatePath('/admin/service-requests');
}

export async function listServiceRequests(
  rawInput: ListServiceRequestsInput = {},
): Promise<ServiceRequestsPage> {
  await ensureAdmin();
  const parsed = listServiceRequestsSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error('INVALID_INPUT');
  const { query, status, page, pageSize } = parsed.data;

  const where: Prisma.ServiceRequestWhereInput = {
    ...(status !== 'ALL' ? { status } : {}),
    ...(query
      ? {
          OR: [
            { requestCode: { contains: query, mode: 'insensitive' } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.serviceRequest.count({ where }),
    db.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        requestCode: true,
        status: true,
        adminNote: true,
        resolvedAt: true,
        createdAt: true,
        category: { select: { name: true } },
        user: {
          select: {
            email: true,
            footballerProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
  ]);

  const items: ServiceRequestRow[] = rows.map((r) => ({
    id: r.id,
    requestCode: r.requestCode,
    status: r.status,
    categoryName: r.category.name,
    userEmail: r.user.email,
    footballerName: r.user.footballerProfile
      ? `${r.user.footballerProfile.firstName} ${r.user.footballerProfile.lastName}`.trim()
      : null,
    adminNote: r.adminNote,
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function resolveServiceRequest(data: unknown): Promise<ServiceRequestActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = resolveServiceRequestSchema.safeParse(data);
  if (!parsed.success) return { status: 'error', message: 'არასწორი მონაცემები' };

  const req = await db.serviceRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true, requestCode: true },
  });
  if (!req) return { status: 'error', message: 'მოთხოვნა ვერ მოიძებნა' };
  if (req.status === 'RESOLVED') return { status: 'success', message: 'უკვე შესრულებულია' };

  await db.serviceRequest.update({
    where: { id: req.id },
    data: {
      status: 'RESOLVED',
      adminNote: parsed.data.adminNote ?? null,
      resolvedAt: new Date(),
      resolvedBy: adminId,
    },
  });
  logger.info(
    { adminId, requestId: req.id, requestCode: req.requestCode, action: 'resolve_service_request' },
    'service_request_resolved',
  );

  revalidateServiceRequestPages();
  return { status: 'success', message: 'მოთხოვნა შესრულდა' };
}

export async function rejectServiceRequest(data: unknown): Promise<ServiceRequestActionState> {
  let adminId: string;
  try {
    adminId = await ensureAdmin();
  } catch {
    return { status: 'error', message: 'წვდომა აკრძალულია' };
  }

  const parsed = rejectServiceRequestSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'არასწორი მონაცემები';
    return { status: 'error', message: msg };
  }

  const req = await db.serviceRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true, requestCode: true },
  });
  if (!req) return { status: 'error', message: 'მოთხოვნა ვერ მოიძებნა' };
  if (req.status === 'REJECTED') return { status: 'success', message: 'უკვე უარყოფილია' };

  await db.serviceRequest.update({
    where: { id: req.id },
    data: {
      status: 'REJECTED',
      adminNote: parsed.data.adminNote,
      resolvedAt: new Date(),
      resolvedBy: adminId,
    },
  });
  logger.info(
    { adminId, requestId: req.id, requestCode: req.requestCode, action: 'reject_service_request' },
    'service_request_rejected',
  );

  revalidateServiceRequestPages();
  return { status: 'success', message: 'მოთხოვნა უარყოფილია' };
}
