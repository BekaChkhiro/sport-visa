export type NotificationEmailProps = {
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  appUrl: string;
};

export function notificationEmailHtml({
  recipientName,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  appUrl,
}: NotificationEmailProps): string {
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<a href="${escapeHtml(ctaUrl)}"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;margin-top:16px;">
          ${escapeHtml(ctaLabel)}
        </a>`
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
              <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
              <div style="font-size:16px;color:#374151;line-height:1.5;">${bodyHtml}</div>
              ${ctaBlock}
              <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;">
                <a href="${escapeHtml(appUrl)}/settings/notifications" style="color:#9ca3af;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function notificationEmailText({
  recipientName,
  bodyText,
  ctaLabel,
  ctaUrl,
  appUrl,
}: NotificationEmailProps): string {
  const ctaSection = ctaLabel && ctaUrl ? `\n${ctaLabel}: ${ctaUrl}\n` : '';
  return `Hi ${recipientName},

${bodyText}${ctaSection}
---
Manage notifications: ${appUrl}/settings/notifications
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
