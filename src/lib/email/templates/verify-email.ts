export type VerifyEmailProps = {
  recipientName: string;
  verifyUrl: string;
  expiresInHours: number;
  appUrl: string;
};

export function verifyEmailHtml({
  recipientName,
  verifyUrl,
  expiresInHours,
  appUrl,
}: VerifyEmailProps): string {
  const expiry = `${expiresInHours} hour${expiresInHours === 1 ? '' : 's'}`;
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
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Verify your email address</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.5;">
                Click the button below to verify your Sport Visa account.
                This link expires in ${escapeHtml(expiry)}.
              </p>
              <a href="${escapeHtml(verifyUrl)}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
                Verify email
              </a>
              <p style="margin:24px 0 0;font-size:14px;color:#6b7280;line-height:1.5;">
                If you did not create a Sport Visa account, you can safely ignore this email.
              </p>
              <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
                <a href="${escapeHtml(appUrl)}" style="color:#9ca3af;">Sport Visa</a>
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

export function verifyEmailText({
  recipientName,
  verifyUrl,
  expiresInHours,
  appUrl,
}: VerifyEmailProps): string {
  const expiry = `${expiresInHours} hour${expiresInHours === 1 ? '' : 's'}`;
  return `Hi ${recipientName},

Verify your Sport Visa account by clicking the link below (expires in ${expiry}):

${verifyUrl}

If you did not create a Sport Visa account, you can safely ignore this email.

Sport Visa — ${appUrl}
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
