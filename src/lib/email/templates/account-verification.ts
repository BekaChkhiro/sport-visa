export type AccountVerificationStatus = 'approved' | 'rejected';

export type AccountVerificationEmailProps = {
  recipientName: string;
  status: AccountVerificationStatus;
  rejectionReason?: string;
  appUrl: string;
};

const STATUS_COLOR: Record<AccountVerificationStatus, string> = {
  approved: '#16a34a',
  rejected: '#dc2626',
};

const STATUS_LABEL: Record<AccountVerificationStatus, string> = {
  approved: 'Approved',
  rejected: 'Not approved',
};

export function accountVerificationEmailHtml({
  recipientName,
  status,
  rejectionReason,
  appUrl,
}: AccountVerificationEmailProps): string {
  const color = STATUS_COLOR[status];
  const label = STATUS_LABEL[status];

  const bodyContent =
    status === 'approved'
      ? `<p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.5;">
          Your account has been verified. You can now access all Sport Visa features.
        </p>
        <a href="${escapeHtml(appUrl)}/dashboard"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
          Go to your dashboard
        </a>`
      : `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.5;">
          Unfortunately, your account could not be verified at this time.
        </p>
        ${
          rejectionReason
            ? `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:4px solid #e5e7eb;color:#374151;font-size:15px;line-height:1.5;">
                ${escapeHtml(rejectionReason)}
              </blockquote>`
            : ''
        }
        <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.5;">
          Please review the feedback, update your profile, and resubmit for verification.
        </p>
        <a href="${escapeHtml(appUrl)}/profile/edit"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
          Update your profile
        </a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${color};text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(label)}</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Account verification update</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
              ${bodyContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function accountVerificationEmailText({
  recipientName,
  status,
  rejectionReason,
  appUrl,
}: AccountVerificationEmailProps): string {
  if (status === 'approved') {
    return `Hi ${recipientName},

Your Sport Visa account has been approved! You can now access all features.

Go to your dashboard: ${appUrl}/dashboard
`;
  }

  const reasonPart = rejectionReason ? `\nReason: ${rejectionReason}\n` : '';
  return `Hi ${recipientName},

Unfortunately, your Sport Visa account could not be verified at this time.${reasonPart}
Please update your profile and resubmit: ${appUrl}/profile/edit
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
