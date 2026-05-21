import { Resend } from 'resend';

import { ApiError } from './api-error';
import {
  accountVerificationEmailHtml,
  accountVerificationEmailText,
  type AccountVerificationEmailProps,
} from './email/templates/account-verification';
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
  passwordResetEmailHtml,
  passwordResetEmailText,
  type PasswordResetEmailProps,
} from './email/templates/password-reset';
import {
  serviceRequestEmailHtml,
  serviceRequestEmailText,
  type ServiceRequestEmailProps,
} from './email/templates/service-request';
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

/** Send a password-reset email with a single-use token link. */
export async function sendPasswordResetEmail(
  to: string,
  props: PasswordResetEmailProps,
): Promise<SendResult> {
  const cfg = getResendConfig();
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject: 'Reset your Sport Visa password',
    html: passwordResetEmailHtml(props),
    text: passwordResetEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send password reset email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}

/** Send an account approval or rejection email from admin. */
export async function sendAccountVerificationEmail(
  to: string,
  props: AccountVerificationEmailProps,
): Promise<SendResult> {
  const cfg = getResendConfig();
  const subject =
    props.status === 'approved'
      ? 'Your Sport Visa account has been approved'
      : 'Update on your Sport Visa account verification';
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject,
    html: accountVerificationEmailHtml(props),
    text: accountVerificationEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send account verification email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}

/** Send a service-request confirmation or resolution email to a footballer. */
export async function sendServiceRequestEmail(
  to: string,
  props: ServiceRequestEmailProps,
): Promise<SendResult> {
  const cfg = getResendConfig();
  const subject =
    props.action === 'submitted'
      ? `Service request received: ${props.serviceType}`
      : `Service request resolved: ${props.serviceType}`;
  const { data, error } = await getClient().emails.send({
    from: cfg.from,
    to,
    subject,
    html: serviceRequestEmailHtml(props),
    text: serviceRequestEmailText(props),
  });
  if (error || !data) {
    throw new ApiError(
      'INTERNAL',
      `Failed to send service request email: ${error?.message ?? 'unknown error'}`,
    );
  }
  return { id: data.id };
}
