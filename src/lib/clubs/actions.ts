'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type SubscribeResult =
  | { status: 'success'; subscribed: boolean }
  | { status: 'error'; message: string };

export async function toggleSubscription(clubProfileId: string): Promise<SubscribeResult> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') return { status: 'error', message: 'წვდომა აკრძალულია' };

  const footballer = await db.footballerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!footballer) return { status: 'error', message: 'ფეხბურთელის პროფილი ვერ მოიძებნა' };

  const existing = await db.clubSubscription.findUnique({
    where: {
      footballerProfileId_clubProfileId: {
        footballerProfileId: footballer.id,
        clubProfileId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.clubSubscription.delete({ where: { id: existing.id } });
    revalidatePath('/clubs');
    revalidatePath(`/clubs/${clubProfileId}`);
    revalidatePath('/dashboard/footballer');
    return { status: 'success', subscribed: false };
  }

  await db.clubSubscription.create({
    data: { footballerProfileId: footballer.id, clubProfileId },
  });
  revalidatePath('/clubs');
  revalidatePath(`/clubs/${clubProfileId}`);
  revalidatePath('/dashboard/footballer');
  return { status: 'success', subscribed: true };
}

type LikeResult =
  | { status: 'success'; liked: boolean; likeCount: number }
  | { status: 'error'; message: string };

// Toggles the current footballer's like on a club post. Only FOOTBALLER role
// can like; clubs and admins are rejected. Returns the post-update like count
// so callers can update the displayed counter without a refetch.
export async function togglePostLike(postId: string): Promise<LikeResult> {
  const session = await auth();
  if (!session?.user?.id) return { status: 'error', message: 'ავტორიზაცია საჭიროა' };
  if (session.user.role !== 'FOOTBALLER') {
    return { status: 'error', message: 'მხოლოდ ფეხბურთელებს შეუძლიათ მოწონება' };
  }

  const footballer = await db.footballerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!footballer) return { status: 'error', message: 'ფეხბურთელის პროფილი ვერ მოიძებნა' };

  const post = await db.clubPost.findUnique({
    where: { id: postId },
    select: { clubId: true },
  });
  if (!post) return { status: 'error', message: 'პოსტი ვერ მოიძებნა' };

  const existing = await db.postLike.findUnique({
    where: { postId_footballerProfileId: { postId, footballerProfileId: footballer.id } },
    select: { id: true },
  });

  if (existing) {
    await db.postLike.delete({ where: { id: existing.id } });
  } else {
    await db.postLike.create({
      data: { postId, footballerProfileId: footballer.id },
    });
  }

  const likeCount = await db.postLike.count({ where: { postId } });
  revalidatePath(`/clubs/${post.clubId}/posts/${postId}`);
  revalidatePath(`/clubs/${post.clubId}`);
  return { status: 'success', liked: !existing, likeCount };
}
