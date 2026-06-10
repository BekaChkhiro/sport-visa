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
        'flex flex-col gap-3 rounded-card border border-ink-800 bg-ink-900 p-4 shadow-card',
        className,
      )}
    >
      <header className="flex items-center gap-3">
        <Avatar className="size-9 rounded-md">
          {clubLogoUrl ? (
            <AvatarImage src={clubLogoUrl} alt={clubName} className="rounded-md" />
          ) : null}
          <AvatarFallback className="rounded-md bg-ink-800 text-xs font-semibold text-ink-300">
            {clubName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight text-ink-50">{clubName}</span>
          <time dateTime={postedAt.toISOString()} className="text-xs text-ink-500">
            {formatRelativeTime(postedAt)}
          </time>
        </div>
      </header>

      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-card bg-ink-800">
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
        <h3 className="text-base font-semibold leading-snug text-ink-50">{title}</h3>
        {excerpt ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">{excerpt}</p>
        ) : null}
      </div>

      <footer className="flex items-center gap-1 border-t border-ink-800 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onLikeToggle(!isLiked)}
          aria-pressed={isLiked}
          aria-label={isLiked ? 'მოწონების გაუქმება' : 'მოწონება'}
          className={cn(
            'gap-1.5 text-ink-400 hover:text-ink-100',
            isLiked && 'text-brand-400 hover:text-brand-300',
          )}
        >
          <HeartIcon className={cn('size-4', isLiked && 'fill-current')} />
          <span className="text-xs font-medium">{likeCount}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-1.5 text-ink-400 hover:text-ink-100"
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
