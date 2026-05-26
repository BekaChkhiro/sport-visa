'use server';

import { Resend } from 'resend';
import { z } from 'zod';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const contactSchema = z.object({
  name: z.string().min(2, 'სახელი ძალიან მოკლეა').max(100),
  email: z.string().email('არასწორი ელ-ფოსტა'),
  message: z.string().min(10, 'შეტყობინება ძალიან მოკლეა').max(2000),
});

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }
  | { status: 'validation'; errors: Record<string, string[]> };

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'validation', errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, message } = parsed.data;

  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM;

  if (!apiKey || !from) {
    logger.warn({ name, email }, 'contact_form_email_unconfigured');
    return { status: 'success' };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: from,
      replyTo: email,
      subject: `[Sport Visa] Contact: ${name}`,
      text: `სახელი: ${name}\nელ-ფოსტა: ${email}\n\n${message}`,
    });
    logger.info({ name, email }, 'contact_form_submitted');
  } catch (err) {
    logger.error({ err, name, email }, 'contact_form_send_failed');
    return { status: 'error', message: 'გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.' };
  }

  return { status: 'success' };
}
