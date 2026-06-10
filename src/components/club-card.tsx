'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { BellIcon, ArrowRightIcon, MapPinIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ClubCardProps = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  league?: string;
  foundedYear?: number;
  logoUrl?: string;
  coverUrl?: string;
  squadCount?: number;
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
  league,
  foundedYear,
  logoUrl,
  coverUrl,
  squadCount,
  verificationStatus,
  canSubscribe = false,
  isSubscribed = false,
  onSubscribeToggle,
  className,
  href,
}: ClubCardProps) {
  const detailHref = href ?? `/clubs/${id}`;

  return (
    <article
      data-slot="club-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card transition-colors hover:border-ink-700 focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2',
        className,
      )}
    >
      {/* Cover strip */}
      <div className="relative h-16 bg-gradient-to-br from-accent-900 to-ink-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover opacity-25"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {/* Crest overlapping cover */}
        <div className="-mt-6 flex items-end justify-between">
          <Avatar className="h-12 w-12 shrink-0 rounded-[13px] border-2 border-ink-900 bg-accent-400/15 text-accent-300">
            {logoUrl ? (
              <AvatarImage
                src={logoUrl}
                alt={`${name} ლოგო`}
                className="rounded-[13px] object-contain"
              />
            ) : null}
            <AvatarFallback className="rounded-[13px] bg-accent-400/15 text-sm font-semibold text-accent-300">
              {clubInitials(name)}
            </AvatarFallback>
          </Avatar>
          <VerificationBadge
            status={verificationStatus}
            showLabel={false}
            className="mb-0.5 shrink-0 rounded-full p-0.5"
          />
        </div>

        {/* Name */}
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-50">
            <Link
              href={detailHref}
              className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
            >
              {name}
            </Link>
          </h3>
          {city && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
              <MapPinIcon className="size-3 shrink-0" aria-hidden="true" />
              {city}
            </p>
          )}
        </div>

        {/* League pill + squad count */}
        <div className="flex items-center gap-2 flex-wrap">
          {league && (
            <span className="rounded-pill bg-accent-400/15 px-2 py-0.5 text-[10.5px] font-semibold text-accent-300">
              {league}
            </span>
          )}
          {typeof squadCount === 'number' && (
            <span className="font-mono tabular-nums text-[12px] text-ink-200">
              {squadCount} მოთამ.
            </span>
          )}
          {foundedYear && <span className="text-[11px] text-ink-500">დაარ. {foundedYear}</span>}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-800 px-4 py-2.5">
        {canSubscribe ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'relative z-10 gap-1.5 text-xs',
              isSubscribed ? 'text-brand-400' : 'text-ink-400',
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
              className={cn('size-3.5', isSubscribed ? 'fill-brand-400' : '')}
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
