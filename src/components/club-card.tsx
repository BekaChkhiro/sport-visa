'use client';

import * as React from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { BellIcon, ArrowRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ClubCardProps = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  league?: string;
  foundedYear?: number;
  logoUrl?: string;
  verificationStatus: VerificationStatus;
  canSubscribe?: boolean;
  isSubscribed?: boolean;
  onSubscribeToggle?: (id: string, next: boolean) => void;
  className?: string;
  href?: string;
};

function clubInitials(name: string) {
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
  league,
  foundedYear,
  logoUrl,
  verificationStatus,
  canSubscribe = false,
  isSubscribed = false,
  onSubscribeToggle,
  className,
  href,
}: ClubCardProps) {
  const detailHref = href ?? `/clubs/${id}`;

  const metaParts = [city, country, league, foundedYear ? `დაარ. ${foundedYear}` : null].filter(
    Boolean,
  );

  return (
    <article
      data-slot="club-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="relative shrink-0">
          <Avatar className="size-14 rounded-lg">
            {logoUrl ? (
              <AvatarImage
                src={logoUrl}
                alt={`${name} ლოგო`}
                className="rounded-lg object-contain"
              />
            ) : null}
            <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
              {clubInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              <Link
                href={detailHref}
                className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
              >
                {name}
              </Link>
            </h3>
            <VerificationBadge
              status={verificationStatus}
              showLabel={false}
              className="mt-0.5 shrink-0 rounded-full p-0.5"
            />
          </div>
          {metaParts.length > 0 && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{metaParts.join(' · ')}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        {canSubscribe ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'relative z-10 gap-1.5 text-xs',
              isSubscribed ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-label={isSubscribed ? 'გამოწერა გაუქ.' : 'გამოწერა'}
            aria-pressed={isSubscribed}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSubscribeToggle?.(id, !isSubscribed);
            }}
          >
            <BellIcon
              className={cn('size-3.5', isSubscribed ? 'fill-primary' : '')}
              aria-hidden="true"
            />
            {isSubscribed ? 'გამოწ. გაუქ.' : 'გამოწ.'}
          </Button>
        ) : (
          <span />
        )}

        <Button variant="outline" size="sm" asChild className="relative z-10 ml-auto gap-1">
          <Link href={detailHref}>
            ნახვა
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export { ClubCard };
export type { ClubCardProps };
