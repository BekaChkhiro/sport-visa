import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const createBodySchema = z.object({
  footballerProfileId: z.string().min(1),
});

/** POST /api/conversations — get or create a 1:1 conversation between the calling club and a footballer. */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();
  if (user.role !== 'CLUB') {
    throw new ApiError('FORBIDDEN', 'Only clubs can initiate conversations');
  }

  const raw = await request.json().catch(() => null);
  const parsed = createBodySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid request body', {
      details: parsed.error.flatten(),
    });
  }

  const footballerProfile = await db.footballerProfile.findUnique({
    where: { id: parsed.data.footballerProfileId },
    select: { userId: true },
  });
  if (!footballerProfile) {
    throw new ApiError('NOT_FOUND', 'Footballer not found');
  }

  const conversation = await db.conversation.upsert({
    where: {
      clubUserId_footballerUserId: {
        clubUserId: user.id,
        footballerUserId: footballerProfile.userId,
      },
    },
    create: {
      clubUserId: user.id,
      footballerUserId: footballerProfile.userId,
    },
    update: {},
    select: { id: true },
  });

  logger.info(
    {
      clubUserId: user.id,
      footballerUserId: footballerProfile.userId,
      conversationId: conversation.id,
    },
    'conversation_opened',
  );

  return NextResponse.json({ conversationId: conversation.id }, { status: 200 });
});
