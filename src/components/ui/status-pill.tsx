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
    className: 'bg-warning-400/10 text-warning-300 border-warning-400/25',
  },
  approved: {
    label: 'დადასტურდა',
    Icon: CheckCircleIcon,
    className: 'bg-success-400/10 text-success-300 border-success-400/25',
  },
  rejected: {
    label: 'უარყოფილია',
    Icon: XCircleIcon,
    className: 'bg-danger-400/10 text-danger-300 border-danger-400/25',
  },
};

function StatusPill({ status, className, children, ...props }: StatusPillProps) {
  const { label, Icon, className: statusClass } = STATUS_CONFIG[status];
  return (
    <span
      data-slot="status-pill"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-[11px] font-semibold',
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
