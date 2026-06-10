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
    className:
      'inline-flex items-center gap-1 rounded-pill border border-success-400/30 bg-success-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-300',
  },
  pending: {
    label: 'განხ. მოლოდინი',
    Icon: PendingBadgeIcon,
    className:
      'inline-flex items-center gap-1 rounded-pill border border-warning-400/30 bg-warning-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-300',
  },
  rejected: {
    label: 'უარყოფილი',
    Icon: XCircleIcon,
    className:
      'inline-flex items-center gap-1 rounded-pill border border-danger-400/30 bg-danger-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger-300',
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
      className={cn(statusClass, className)}
      {...props}
    >
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  );
}

export { VerificationBadge };
export type { VerificationStatus };
