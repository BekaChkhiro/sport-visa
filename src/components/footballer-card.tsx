'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { PositionChip } from '@/components/position-chip';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { ArrowRightIcon, StarIcon, UserIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type FootballerCardProps = {
  id: string;
  name: string;
  position: string;
  nationality: string;
  age?: number;
  height?: number;
  photoUrl?: string;
  verificationStatus: VerificationStatus;
  isSaved: boolean;
  onSaveToggle: (id: string, saved: boolean) => void;
  className?: string;
  href?: string;
};

function FootballerCard({
  id,
  name,
  position,
  nationality,
  age,
  height,
  photoUrl,
  verificationStatus,
  isSaved,
  onSaveToggle,
  className,
  href,
}: FootballerCardProps) {
  const detailHref = href ?? `/directory/${id}`;
  const metaParts = [
    typeof age === 'number' ? `${age}` : null,
    typeof height === 'number' ? `${height} სმ` : null,
  ].filter(Boolean);

  return (
    <article
      data-slot="footballer-card"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <UserIcon className="size-12" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <VerificationBadge
            status={verificationStatus}
            showLabel={false}
            className="rounded-full p-1"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PositionChip position={position} />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {nationality}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isSaved ? 'შენახული — ჩამოშორება' : 'შენახვა'}
            aria-pressed={isSaved}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSaveToggle(id, !isSaved);
            }}
            className="size-8"
          >
            <StarIcon
              className={cn(
                'size-4',
                isSaved ? 'fill-primary text-primary' : 'text-muted-foreground',
              )}
            />
          </Button>
        </div>

        <h3 className="text-base font-semibold leading-snug">
          <Link
            href={detailHref}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {name}
          </Link>
        </h3>

        {metaParts.length > 0 ? (
          <p className="text-xs leading-normal text-muted-foreground">{metaParts.join(' · ')}</p>
        ) : null}

        <div className="mt-auto flex justify-end pt-1">
          <Button variant="ghost" size="sm" asChild className="relative z-10">
            <Link href={detailHref}>
              ვრცლად
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export { FootballerCard };
