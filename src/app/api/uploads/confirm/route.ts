import { MediaKind, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  MAX_UPLOAD_BYTES,
  deleteObject,
  headObject,
  isAllowedImageType,
  publicUrlForKey,
} from '@/lib/r2';

export const runtime = 'nodejs';

const confirmSchema = z.object({
  key: z.string().min(1).max(512),
  kind: z.nativeEnum(MediaKind),
});

export const POST = apiHandler(async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', 'Request body must be valid JSON');
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid confirm request', {
      details: parsed.error.flatten().fieldErrors,
    });
  }
  const { key, kind } = parsed.data;

  // Verify the object actually landed in R2 and pull its real size + type.
  // We trust R2 over anything the client sends in this step — the presign
  // endpoint already validated the declared values, but the client might
  // never have completed the PUT.
  const head = await headObject(key);
  if (!head) {
    throw new ApiError('NOT_FOUND', 'Uploaded object not found in storage', {
      details: { key },
    });
  }

  // Defensive re-check against the same allowlist + size cap as presign.
  // R2 records whatever Content-Type the PUT sent, so a misbehaving client
  // can't sneak through a different type just by skipping presign.
  if (!isAllowedImageType(head.contentType)) {
    await deleteObject(key);
    throw new ApiError('VALIDATION', 'Uploaded object has disallowed content type', {
      details: { key, contentType: head.contentType },
    });
  }
  if (head.contentLength > MAX_UPLOAD_BYTES) {
    await deleteObject(key);
    throw new ApiError('VALIDATION', 'Uploaded object exceeds maximum size', {
      details: { key, maxBytes: MAX_UPLOAD_BYTES, gotBytes: head.contentLength },
    });
  }

  try {
    const media = await db.media.create({
      data: {
        key,
        kind,
        contentType: head.contentType,
        size: head.contentLength,
      },
      select: { id: true, key: true, kind: true, contentType: true, size: true, createdAt: true },
    });

    logger.info({ mediaId: media.id, key, kind, size: media.size }, 'r2_upload_confirmed');

    return NextResponse.json(
      {
        ...media,
        url: publicUrlForKey(media.key),
      },
      { status: 201 },
    );
  } catch (err) {
    // Two clients race-confirming the same key (or a buggy retry) would hit
    // the unique constraint on `key`. Surface it as a conflict, but leave
    // the object in R2 — the earlier-winning row still references it.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ApiError('CONFLICT', 'Object key already recorded', { details: { key } });
    }
    throw err;
  }
});
