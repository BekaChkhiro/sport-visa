import * as React from 'react';

import { StatusPill, type StatusPillStatus } from '@/components/ui/status-pill';
import {
  MealPlanIcon,
  OtherServicesIcon,
  PersonalTrainerIcon,
  TeamDoctorIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

type ServiceType = 'meal_plan' | 'personal_trainer' | 'team_doctor' | 'other';

type ServiceRequestRowProps = {
  id: string;
  type: ServiceType;
  status: StatusPillStatus;
  requestedAt: Date;
  className?: string;
};

const SERVICE_CONFIG: Record<
  ServiceType,
  { label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  meal_plan: { label: 'კვების გეგმა', Icon: MealPlanIcon },
  personal_trainer: { label: 'პერსონალური მწვრთნელი', Icon: PersonalTrainerIcon },
  team_doctor: { label: 'გუნდის ექიმი', Icon: TeamDoctorIcon },
  other: { label: 'სხვა სერვისი', Icon: OtherServicesIcon },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ka', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date,
  );
}

function ServiceRequestRow({ id, type, status, requestedAt, className }: ServiceRequestRowProps) {
  const { label, Icon } = SERVICE_CONFIG[type];
  return (
    <div
      data-slot="service-request-row"
      data-request-id={id}
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={16} className="shrink-0 text-muted-foreground" />
        <span className="truncate text-sm leading-relaxed">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusPill status={status} />
        <time
          dateTime={requestedAt.toISOString()}
          className="hidden text-xs text-muted-foreground sm:inline"
        >
          {formatDate(requestedAt)}
        </time>
      </div>
    </div>
  );
}

export { ServiceRequestRow };
export type { ServiceType };
