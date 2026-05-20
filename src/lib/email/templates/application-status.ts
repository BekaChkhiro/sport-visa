export type ApplicationStatus = 'accepted' | 'rejected' | 'shortlisted';

export type ApplicationStatusEmailProps = {
  playerName: string;
  clubName: string;
  status: ApplicationStatus;
  message?: string;
  appUrl: string;
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  accepted: 'Accepted',
  rejected: 'Not progressed',
  shortlisted: 'Shortlisted',
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  accepted: '#16a34a',
  rejected: '#dc2626',
  shortlisted: '#d97706',
};

export function applicationStatusEmailHtml({
  playerName,
  clubName,
  status,
  message,
  appUrl,
}: ApplicationStatusEmailProps): string {
  const label = STATUS_LABEL[status];
  const color = STATUS_COLOR[status];
  const messageBlock = message
    ? `<blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid #e5e7eb;color:#374151;font-size:15px;line-height:1.5;">
        ${escapeHtml(message)}
      </blockquote>`
    : '';

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
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Application update from ${escapeHtml(clubName)}</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${escapeHtml(playerName)},</p>
              <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.5;">
                ${escapeHtml(clubName)} has reviewed your application and marked it as
                <strong style="color:${color};">${escapeHtml(label)}</strong>.
              </p>
              ${messageBlock}
              <a href="${escapeHtml(appUrl)}/applications"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;margin-top:16px;">
                View your applications
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function applicationStatusEmailText({
  playerName,
  clubName,
  status,
  message,
  appUrl,
}: ApplicationStatusEmailProps): string {
  const label = STATUS_LABEL[status];
  const messagePart = message ? `\nMessage from ${clubName}:\n"${message}"\n` : '';
  return `Hi ${playerName},

${clubName} has reviewed your application: ${label}.${messagePart}
View your applications: ${appUrl}/applications
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
