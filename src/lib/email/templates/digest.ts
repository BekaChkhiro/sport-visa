export type DigestPost = {
  clubName: string;
  postTitle: string;
};

export type DigestEmailProps = {
  recipientName: string;
  posts: DigestPost[];
  appUrl: string;
};

export function digestEmailHtml({ recipientName, posts, appUrl }: DigestEmailProps): string {
  const rows = posts
    .map(
      (p) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(p.clubName)}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(p.postTitle)}</p>
            </td>
          </tr>`,
    )
    .join('');

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
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Daily newsfeed digest</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">
                Here are the latest posts from your subscribed clubs:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
              <a href="${escapeHtml(appUrl)}/dashboard/footballer"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;margin-top:24px;">
                Open newsfeed
              </a>
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

export function digestEmailText({ recipientName, posts, appUrl }: DigestEmailProps): string {
  const lines = posts.map((p) => `- ${p.clubName}: "${p.postTitle}"`).join('\n');
  return `Hi ${recipientName},

Here are the latest posts from your subscribed clubs:

${lines}

Open newsfeed: ${appUrl}/dashboard/footballer

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
