export type ServiceRequestAction = 'submitted' | 'resolved';

export type ServiceRequestEmailProps = {
  footballerName: string;
  serviceType: string;
  requestId: string;
  action: ServiceRequestAction;
  appUrl: string;
};

const ACTION_LABEL: Record<ServiceRequestAction, string> = {
  submitted: 'Request received',
  resolved: 'Request resolved',
};

const ACTION_COLOR: Record<ServiceRequestAction, string> = {
  submitted: '#2563eb',
  resolved: '#16a34a',
};

export function serviceRequestEmailHtml({
  footballerName,
  serviceType,
  requestId,
  action,
  appUrl,
}: ServiceRequestEmailProps): string {
  const label = ACTION_LABEL[action];
  const color = ACTION_COLOR[action];

  const bodyContent =
    action === 'submitted'
      ? `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.5;">
          We received your <strong>${escapeHtml(serviceType)}</strong> service request
          (ID: <code style="font-size:14px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${escapeHtml(requestId)}</code>).
          Our team will review it within 24–48 hours.
        </p>
        <a href="${escapeHtml(appUrl)}/dashboard"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
          View on dashboard
        </a>`
      : `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.5;">
          Your <strong>${escapeHtml(serviceType)}</strong> service request
          (ID: <code style="font-size:14px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${escapeHtml(requestId)}</code>)
          has been resolved.
        </p>
        <a href="${escapeHtml(appUrl)}/dashboard"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
          View on dashboard
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
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Service request update</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${escapeHtml(footballerName)},</p>
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

export function serviceRequestEmailText({
  footballerName,
  serviceType,
  requestId,
  action,
  appUrl,
}: ServiceRequestEmailProps): string {
  if (action === 'submitted') {
    return `Hi ${footballerName},

We received your "${serviceType}" service request (ID: ${requestId}).
Our team will review it within 24–48 hours.

View on dashboard: ${appUrl}/dashboard
`;
  }

  return `Hi ${footballerName},

Your "${serviceType}" service request (ID: ${requestId}) has been resolved.

View on dashboard: ${appUrl}/dashboard
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
