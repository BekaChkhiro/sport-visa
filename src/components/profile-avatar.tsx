'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CameraIcon } from '@/components/icons';
import { VerificationBadge, type VerificationStatus } from '@/components/verification-badge';
import { cn } from '@/lib/utils';

type ProfileAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type ProfileAvatarProps = {
  src?: string;
  fallback: string;
  size?: ProfileAvatarSize;
  verificationStatus?: VerificationStatus;
  editable?: boolean;
  onEdit?: () => void;
  alt?: string;
  className?: string;
  rounded?: 'full' | 'md';
};

const SIZE_CLASS: Record<ProfileAvatarSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-20',
  xl: 'size-32',
};

const BADGE_OFFSET: Record<ProfileAvatarSize, string> = {
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-1 -right-1',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1 -right-1',
};

/**
 * Picks a gradient family from the name hash so each person gets a consistent
 * fallback colour across sessions.
 */
function gradientForName(name: string): string {
  const families = [
    'from-brand-400 to-brand-600',
    'from-accent-400 to-accent-600',
    'from-iris-400 to-iris-600',
    'from-flame-400 to-flame-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return families[hash % families.length]!;
}

function ProfileAvatar({
  src,
  fallback,
  size = 'md',
  verificationStatus,
  editable = false,
  onEdit,
  alt,
  className,
  rounded = 'full',
}: ProfileAvatarProps) {
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-md';
  const gradient = gradientForName(fallback);

  return (
    <div data-slot="profile-avatar" className={cn('relative inline-block', className)}>
      <Avatar className={cn(SIZE_CLASS[size], roundedClass, 'ring-2 ring-ink-900 shadow-xs')}>
        {src ? <AvatarImage src={src} alt={alt ?? fallback} className={roundedClass} /> : null}
        <AvatarFallback
          className={cn('bg-gradient-to-br font-bold text-ink-950', gradient, roundedClass)}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>

      {verificationStatus ? (
        <span
          className={cn(
            'absolute inline-flex items-center justify-center rounded-full bg-ink-900 p-0.5',
            BADGE_OFFSET[size],
          )}
        >
          <VerificationBadge
            status={verificationStatus}
            showLabel={false}
            className="rounded-full p-1"
          />
        </span>
      ) : null}

      {editable ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label="ფოტო შეცვლა"
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
            roundedClass,
          )}
        >
          <CameraIcon className="size-6" />
        </button>
      ) : null}
    </div>
  );
}

export { ProfileAvatar };
export type { ProfileAvatarSize };
