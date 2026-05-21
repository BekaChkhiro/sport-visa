import { MediaKind } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  createPresignedPutUrl,
  isAllowedImageType,
} from '@/lib/r2';

export const runtime = 'nodejs';

const presignSchema = z.object({
  kind: z.nativeEnum(MediaKind),
  contentType: z.string().min(1).max(255),
  // Bytes. We cap at MAX_UPLOAD_BYTES; the presigned URL signs Content-Length
  // so a client that lies here can't actually upload a larger payload.
  contentLength: z.number().int().positive(),
});

export const POST = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', 'Request body must be valid JSON');
  }

  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid presign request', {
      details: parsed.error.flatten().fieldErrors,
    });
  }
  const { kind, contentType, contentLength } = parsed.data;

  if (!isAllowedImageType(contentType)) {
    throw new ApiError('VALIDATION', `Unsupported content type: ${contentType}`, {
      details: { allowed: ALLOWED_IMAGE_TYPES },
    });
  }
  if (contentLength > MAX_UPLOAD_BYTES) {
    throw new ApiError('VALIDATION', 'File exceeds maximum upload size', {
      details: { maxBytes: MAX_UPLOAD_BYTES, gotBytes: contentLength },
    });
  }

  const presigned = await createPresignedPutUrl({ kind, contentType, contentLength });

  logger.info(
    { userId: user.id, kind, contentType, contentLength, key: presigned.key },
    'r2_presigned_put_issued',
  );

  return NextResponse.json(presigned, { status: 200 });
});
