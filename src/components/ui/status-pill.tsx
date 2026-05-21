import * as React from 'react';

import { CheckCircleIcon, PendingBadgeIcon, XCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type StatusPillStatus = 'pending' | 'approved' | 'rejected';

type StatusPillProps = React.ComponentProps<'span'> & {
  status: StatusPillStatus;
};

const STATUS_CONFIG: Record<
  StatusPillStatus,
  {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    className: string;
  }
> = {
  pending: {
    label: 'მოლოდინში',
    Icon: PendingBadgeIcon,
    className: 'bg-warning/10 text-warning',
  },
  approved: {
    label: 'დადასტურდა',
    Icon: CheckCircleIcon,
    className: 'bg-success/10 text-success',
  },
  rejected: {
    label: 'უარყოფილია',
    Icon: XCircleIcon,
    className: 'bg-destructive/10 text-destructive',
  },
};

function StatusPill({ status, className, children, ...props }: StatusPillProps) {
  const { label, Icon, className: statusClass } = STATUS_CONFIG[status];
  return (
    <span
      data-slot="status-pill"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        statusClass,
        className,
      )}
      {...props}
    >
      <Icon size={12} className="shrink-0" />
      {children ?? label}
    </span>
  );
}

export { StatusPill };
export type { StatusPillStatus };
