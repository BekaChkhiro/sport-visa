import { NextResponse } from 'next/server';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { getEmailDigestEnabled } from '@/lib/notification-preferences';
import { sendDigestEmail } from '@/lib/resend';

export const runtime = 'nodejs';

const INTERNAL_KEY_HEADER = 'x-internal-key';

async function authorizeDigestSender(request: Request): Promise<{ caller: string }> {
  const presented = request.headers.get(INTERNAL_KEY_HEADER);
  const internalKey = env.EMAIL_INTERNAL_KEY;
  if (presented && internalKey && presented === internalKey) {
    return { caller: 'internal' };
  }
  const user = await requireAuthenticatedUser();
  if (user.role !== 'ADMIN') {
    throw new ApiError('FORBIDDEN', 'Admin role required to send digest');
  }
  return { caller: `admin:${user.id}` };
}

export const POST = apiHandler(async (request: Request) => {
  const { caller } = await authorizeDigestSender(request);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Collect all unread NEW_CLUB_POST notifications from the last 24 h.
  const notifications = await db.notification.findMany({
    where: {
      type: 'NEW_CLUB_POST',
      read: false,
      createdAt: { gte: since },
    },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (notifications.length === 0) {
    logger.info({ caller }, 'digest_send_no_notifications');
    return NextResponse.json({ sent: 0, skipped: 0 }, { status: 200 });
  }

  // Group by userId.
  const byUser = new Map<
    string,
    {
      email: string;
      firstName: string | null;
      lastName: string | null;
      items: Array<{ title: string; body: string }>;
    }
  >();

  for (const n of notifications) {
    if (!byUser.has(n.userId)) {
      byUser.set(n.userId, {
        email: n.user.email,
        firstName: n.user.firstName ?? null,
        lastName: n.user.lastName ?? null,
        items: [],
      });
    }
    byUser.get(n.userId)!.items.push({ title: n.title, body: n.body });
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  let sent = 0;
  let skipped = 0;

  await Promise.allSettled(
    Array.from(byUser.entries()).map(async ([userId, userData]) => {
      const recipientName = userData.firstName ?? userData.email.split('@')[0] ?? 'there';

      // Map notification title/body → {clubName, postTitle}.
      // Notification title format: "New post from <ClubName>"
      const posts = userData.items.map((item) => ({
        clubName: item.title.replace(/^New post from /, '') || item.title,
        postTitle: item.body,
      }));

      try {
        const digestEnabled = await getEmailDigestEnabled(userId);
        if (!digestEnabled) {
          skipped++;
          logger.debug({ caller, userId }, 'digest_email_skipped_preference');
          return;
        }
        await sendDigestEmail(userData.email, { recipientName, posts, appUrl });
        sent++;
        logger.info({ caller, userId, postCount: posts.length }, 'digest_email_sent');
      } catch (err) {
        skipped++;
        logger.warn({ caller, userId, err }, 'digest_email_failed');
      }
    }),
  );

  return NextResponse.json({ sent, skipped }, { status: 200 });
});
