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

  return (
    <div data-slot="profile-avatar" className={cn('relative inline-block', className)}>
      <Avatar className={cn(SIZE_CLASS[size], roundedClass, 'shadow-sm')}>
        {src ? <AvatarImage src={src} alt={alt ?? fallback} className={roundedClass} /> : null}
        <AvatarFallback
          className={cn('bg-muted text-muted-foreground font-semibold', roundedClass)}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>

      {verificationStatus ? (
        <span
          className={cn(
            'absolute inline-flex items-center justify-center rounded-full bg-background p-0.5 shadow-sm',
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
            'absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
