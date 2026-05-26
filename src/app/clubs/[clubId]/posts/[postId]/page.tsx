import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/icons';
import { db } from '@/lib/db';

type Props = {
  params: Promise<{ clubId: string; postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await db.clubPost.findUnique({
    where: { id: postId },
    select: { title: true },
  });
  if (!post) return { title: 'პოსტი ვერ მოიძებნა' };
  return { title: post.title };
}

function clubInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function ClubPostDetailPage({ params }: Props) {
  const { clubId, postId } = await params;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const post = await db.clubPost.findFirst({
    where: { id: postId, clubId },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { likes: true } },
      club: {
        select: {
          id: true,
          name: true,
          logoKey: true,
        },
      },
    },
  });

  if (!post) notFound();

  const logoUrl = post.club.logoKey ? `${r2BaseUrl}/${post.club.logoKey}` : undefined;
  const initials = clubInitials(post.club.name);

  const publishedAt = post.createdAt.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/clubs/${clubId}?tab=news`}>
            <ArrowLeftIcon className="size-4" />
            სიახლეებზე დაბრუნება
          </Link>
        </Button>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            {logoUrl && (
              <AvatarImage
                src={logoUrl}
                alt={post.club.name}
                className="rounded-lg object-contain"
              />
            )}
            <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link href={`/clubs/${clubId}`} className="text-sm font-medium hover:underline">
              {post.club.name}
            </Link>
            <p className="text-xs text-muted-foreground">{publishedAt}</p>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold leading-snug">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {post.body}
        </p>

        <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          ❤ {post._count.likes}
        </div>
      </article>
    </div>
  );
}
