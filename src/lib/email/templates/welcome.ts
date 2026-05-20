export type WelcomeEmailProps = {
  name: string;
  appUrl: string;
};

export function welcomeEmailHtml({ name, appUrl }: WelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Sport Visa</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Welcome to Sport Visa</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;">Hi ${escapeHtml(name)},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.5;">
                Your account is ready. Sport Visa connects footballers and clubs worldwide —
                complete your profile to start getting discovered.
              </p>
              <a href="${escapeHtml(appUrl)}/onboarding"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
                Complete your profile
              </a>
              <p style="margin:32px 0 0;font-size:14px;color:#6b7280;">
                If you did not create this account, you can safely ignore this email.
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

export function welcomeEmailText({ name, appUrl }: WelcomeEmailProps): string {
  return `Welcome to Sport Visa, ${name}!

Your account is ready. Complete your profile to start getting discovered:
${appUrl}/onboarding

If you did not create this account, you can safely ignore this email.
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
