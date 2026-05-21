import * as React from 'react';

import { PendingBadgeIcon, VerifiedBadgeIcon, XCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type VerificationStatus = 'verified' | 'pending' | 'rejected';

type VerificationBadgeProps = React.ComponentProps<'span'> & {
  status: VerificationStatus;
  showLabel?: boolean;
};

const CONFIG: Record<
  VerificationStatus,
  {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    className: string;
  }
> = {
  verified: {
    label: 'ვერიფიცირებული',
    Icon: VerifiedBadgeIcon,
    className: 'bg-success/10 text-success',
  },
  pending: {
    label: 'განხ. მოლოდინი',
    Icon: PendingBadgeIcon,
    className: 'bg-warning/10 text-warning',
  },
  rejected: {
    label: 'უარყოფილი',
    Icon: XCircleIcon,
    className: 'bg-destructive/10 text-destructive',
  },
};

function VerificationBadge({
  status,
  showLabel = true,
  className,
  ...props
}: VerificationBadgeProps) {
  const { label, Icon, className: statusClass } = CONFIG[status];

  if (!showLabel) {
    return (
      <span
        data-slot="verification-badge"
        data-status={status}
        aria-label={label}
        className={cn('inline-flex items-center justify-center', statusClass, className)}
        {...props}
      >
        <Icon size={16} className="shrink-0" />
      </span>
    );
  }

  return (
    <span
      data-slot="verification-badge"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        statusClass,
        className,
      )}
      {...props}
    >
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  );
}

export { VerificationBadge };
export type { VerificationStatus };
