import { Resend } from 'resend';

import { ApiError } from './api-error';
import {
  applicationStatusEmailHtml,
  applicationStatusEmailText,
  type ApplicationStatusEmailProps,
} from './email/templates/application-status';
import {
  notificationEmailHtml,
  notificationEmailText,
  type NotificationEmailProps,
} from './email/templates/notification';
import {
  welcomeEmailHtml,
  welcomeEmailText,
  type WelcomeEmailProps,
} from './email/templates/welcome';
import { env } from './env';

type ResendConfig = {
  apiKey: string;
  from: string;
};

function getResendConfig(): ResendConfig {
  const { RESEND_API_KEY, RESEND_FROM } = env;
  if (!RESEND_API_KEY || !RESEND_FROM) {
    throw new ApiError(
      'INTERNAL',
      'Resend is not configured — set RESEND_API_KEY and RESEND_FROM (see docs/email.md)',
    );
  }
  return { apiKey: RESEND_API_KEY, from: RESEND_FROM };
}

let cachedClient: Resend | undefined;

function getClient(): Resend {
  if (cachedClient) return cachedClient;
  const cfg = getResendConfig();
  cachedClient = new Resend(cfg.apiKey);
  return cachedClient;
}

export type SendResult = { id: string };

/** Send a welcome email to a newly-registered user. */
export async function sendWelcomeEmail(to: string, props: WelcomeEmailProps): Promise<SendResult> {
  const cfg = getResendConfig();
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject: 'Welcome to Sport Visa',
    html: welcomeEmailHtml(props),
    text: welcomeEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send welcome email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}

/** Send an application status update to a player. */
export async function sendApplicationStatusEmail(
  to: string,
  props: ApplicationStatusEmailProps,
): Promise<SendResult> {
  const cfg = getResendConfig();
  const statusLabel =
    props.status === 'accepted'
      ? 'Accepted'
      : props.status === 'shortlisted'
        ? 'Shortlisted'
        : 'Update on';
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject: `${statusLabel}: your application to ${props.clubName}`,
    html: applicationStatusEmailHtml(props),
    text: applicationStatusEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send application status email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}

/** Send a generic notification email. */
export async function sendNotificationEmail(
  to: string,
  props: NotificationEmailProps,
): Promise<SendResult> {
  const cfg = getResendConfig();
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject: props.subject,
    html: notificationEmailHtml(props),
    text: notificationEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send notification email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}
