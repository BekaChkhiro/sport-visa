'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { PositionChip } from '@/components/position-chip';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { StarIcon, UserIcon } from '@/components/icons';
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
        'group relative flex flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card transition-colors hover:border-ink-700 focus-within:ring-2 focus-within:ring-brand-400 focus-within:ring-offset-2',
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-800">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-600">
            <UserIcon className="size-12" />
          </div>
        )}
        {/* Online dot */}
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-2 h-3 w-3 rounded-full bg-success-400 ring-2 ring-ink-900"
        />
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
          <PositionChip position={position} />
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
            className="size-8 text-ink-400 hover:text-brand-400"
          >
            <StarIcon
              className={cn('size-4', isSaved ? 'fill-brand-400 text-brand-400' : 'text-ink-400')}
            />
          </Button>
        </div>

        <h3 className="text-[14.5px] font-semibold leading-snug text-ink-50">
          <Link
            href={detailHref}
            className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
          >
            {name}
          </Link>
        </h3>

        {/* Meta row */}
        <p className="text-[12px] text-ink-400">
          <span>{nationality}</span>
          {metaParts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="mx-1 text-ink-600">·</span>
              <span>{part}</span>
            </React.Fragment>
          ))}
        </p>

        <div className="mt-auto flex gap-2 pt-1">
          <Button variant="outline" size="sm" asChild className="relative z-10 flex-1">
            <Link href={detailHref}>პროფილი</Link>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="relative z-10 flex-1"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSaveToggle(id, !isSaved);
            }}
            aria-pressed={isSaved}
          >
            შორთლისტი
          </Button>
        </div>
      </div>
    </article>
  );
}

export { FootballerCard };
