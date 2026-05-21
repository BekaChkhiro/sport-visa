'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { resendVerificationEmailAction } from '@/lib/auth/actions-verify';

type State = 'idle' | 'sent' | 'error';

export function ResendButton() {
  const [uiState, setUiState] = React.useState<State>('idle');
  const [pending, startTransition] = React.useTransition();

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerificationEmailAction();
      setUiState(result.status === 'success' ? 'sent' : 'error');
    });
  }

  if (uiState === 'sent') {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
        ✓ ახალი ლინკი გაიგზავნა — შეამოწმე ელ. ფოსტა.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full" onClick={handleResend} disabled={pending}>
        {pending ? 'გაგზავნა...' : 'ახლიდან გაგზავნა'}
      </Button>
      {uiState === 'error' && (
        <p className="text-sm text-destructive">გაგზავნა ვერ მოხერხდა. სცადე თავიდან.</p>
      )}
    </div>
  );
}
