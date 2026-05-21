'use client';

import * as React from 'react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HeartIcon, MessageCircleIcon } from '@/components/icons';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

type NewsfeedCardProps = {
  clubName: string;
  clubLogoUrl?: string;
  postedAt: Date;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onLikeToggle: (liked: boolean) => void;
  onCommentClick?: () => void;
  className?: string;
};

function NewsfeedCard({
  clubName,
  clubLogoUrl,
  postedAt,
  title,
  excerpt,
  imageUrl,
  likeCount,
  commentCount,
  isLiked,
  onLikeToggle,
  onCommentClick,
  className,
}: NewsfeedCardProps) {
  return (
    <article
      data-slot="newsfeed-card"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        className,
      )}
    >
      <header className="flex items-center gap-3">
        <Avatar className="size-9 rounded-md">
          {clubLogoUrl ? (
            <AvatarImage src={clubLogoUrl} alt={clubName} className="rounded-md" />
          ) : null}
          <AvatarFallback className="rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {clubName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{clubName}</span>
          <time dateTime={postedAt.toISOString()} className="text-xs text-muted-foreground">
            {formatRelativeTime(postedAt)}
          </time>
        </div>
      </header>

      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        {excerpt ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        ) : null}
      </div>

      <footer className="flex items-center gap-1 border-t border-border pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onLikeToggle(!isLiked)}
          aria-pressed={isLiked}
          aria-label={isLiked ? 'მოწონების გაუქმება' : 'მოწონება'}
          className={cn('gap-1.5', isLiked && 'text-primary')}
        >
          <HeartIcon className={cn('size-4', isLiked && 'fill-current')} />
          <span className="text-xs font-medium">{likeCount}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-1.5"
          aria-label="კომენტარები"
        >
          <MessageCircleIcon className="size-4" />
          <span className="text-xs font-medium">{commentCount}</span>
        </Button>
      </footer>
    </article>
  );
}

export { NewsfeedCard };
