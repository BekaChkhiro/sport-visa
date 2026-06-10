'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileTextIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type AdminQueueRole = 'footballer' | 'club';

type AdminQueueRowProps = {
  userId: string;
  name: string;
  role: AdminQueueRole;
  submittedAt: Date;
  cvUrl?: string;
  photoUrl?: string;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
  className?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ka', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date,
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function AdminQueueRow({
  userId,
  name,
  role,
  submittedAt,
  cvUrl,
  photoUrl,
  onApprove,
  onReject,
  className,
}: AdminQueueRowProps) {
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');

  const handleReject = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onReject(userId, trimmed);
    setReason('');
    setRejectOpen(false);
  };

  return (
    <tr
      data-slot="admin-queue-row"
      data-user-id={userId}
      className={cn(
        'border-b border-ink-800 bg-ink-900 transition-colors hover:bg-ink-800/50',
        className,
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-8 shrink-0">
            {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
            <AvatarFallback className="bg-ink-800 text-xs font-semibold text-ink-300">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium text-ink-100">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="capitalize bg-ink-800 text-ink-300 border-ink-700">
          {role === 'footballer' ? 'მოთამაშე' : 'კლუბი'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <time dateTime={submittedAt.toISOString()} className="font-mono text-xs text-ink-500">
          {formatDate(submittedAt)}
        </time>
      </td>
      <td className="px-4 py-3">
        {cvUrl ? (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-400 underline-offset-4 hover:underline"
          >
            <FileTextIcon className="size-4" />
            CV
          </a>
        ) : (
          <span className="font-mono text-xs text-ink-500">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="default" size="sm" onClick={() => onApprove(userId)}>
            დადასტ.
          </Button>
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setRejectOpen(true)}
            >
              უარყ.
            </Button>
            <DialogContent className="border-ink-800 bg-ink-900">
              <DialogHeader>
                <DialogTitle className="text-ink-50">უარყოფის მიზეზი</DialogTitle>
                <DialogDescription className="text-ink-400">
                  მიუთითეთ მოკლე ახსნა — ის გაიგზავნება მომხმარებელთან.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`reject-reason-${userId}`} className="text-ink-200">
                  მიზეზი
                </Label>
                <Textarea
                  id={`reject-reason-${userId}`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="მაგ. ბუნდოვანი დოკუმენტი…"
                  rows={4}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    გაუქმება
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!reason.trim()}
                >
                  უარყოფა
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </td>
    </tr>
  );
}

export { AdminQueueRow };
export type { AdminQueueRole };
