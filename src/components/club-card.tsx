'use client';

import * as React from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { StarIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ClubCardProps = {
  id: string;
  name: string;
  city?: string;
  country: string;
  logoUrl?: string;
  verificationStatus: VerificationStatus;
  isSubscribed: boolean;
  onSubscribeToggle: (id: string, subscribed: boolean) => void;
  className?: string;
  href?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ClubCard({
  id,
  name,
  city,
  country,
  logoUrl,
  verificationStatus,
  isSubscribed,
  onSubscribeToggle,
  className,
  href,
}: ClubCardProps) {
  const detailHref = href ?? `/clubs/${id}`;
  const meta = [city, country].filter(Boolean).join(', ');

  return (
    <article
      data-slot="club-card"
      className={cn(
        'group relative flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <Avatar className="size-12 rounded-md">
        {logoUrl ? <AvatarImage src={logoUrl} alt={name} className="rounded-md" /> : null}
        <AvatarFallback className="rounded-md bg-muted text-muted-foreground font-semibold">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold leading-snug">
            <Link
              href={detailHref}
              className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
            >
              {name}
            </Link>
          </h3>
          {verificationStatus === 'verified' ? (
            <VerificationBadge status="verified" showLabel={false} className="rounded-full p-0.5" />
          ) : null}
        </div>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isSubscribed ? 'გამოწერა გაუქმდეს' : 'გამოწერა'}
        aria-pressed={isSubscribed}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSubscribeToggle(id, !isSubscribed);
        }}
        className="relative z-10 shrink-0"
      >
        <StarIcon
          className={cn(
            'size-5',
            isSubscribed ? 'fill-primary text-primary' : 'text-muted-foreground',
          )}
        />
      </Button>
    </article>
  );
}

export { ClubCard };
