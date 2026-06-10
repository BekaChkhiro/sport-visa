'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';

import { submitContact, type ContactFormState } from '@/lib/contact/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const INITIAL_STATE: ContactFormState = { status: 'idle' };

export function Contact() {
  const [state, action, isPending] = useActionState(submitContact, INITIAL_STATE);

  const fieldError = (field: string) =>
    state.status === 'validation' ? state.errors[field]?.[0] : undefined;

  return (
    <section className="bg-ink-900/50 px-4 py-16 sm:py-20">
      <div className="container mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-400">
                CONTACT
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-50 sm:text-3xl">
                დაგვიკავშირდით
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-400 sm:text-base">
                გაქვთ კითხვა, წინადადება ან გჭირდებათ დახმარება? დაწერეთ ჩვენ — ჩვეულებრივ ვპასუხობთ
                1-2 სამუშაო დღის განმავლობაში.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-ink-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-card bg-brand-400/10 text-brand-300">
                  <Mail className="h-4 w-4" aria-hidden />
                </div>
                <span>info@sportvisa.ge</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-card bg-brand-400/10 text-brand-300">
                  <MessageSquare className="h-4 w-4" aria-hidden />
                </div>
                <span>პასუხობთ 1–2 სამუშაო დღეში</span>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-card border border-ink-800 bg-ink-900 p-6 sm:p-8">
            {state.status === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-400/10 text-brand-300">
                  <Send className="h-5 w-5" aria-hidden />
                </div>
                <p className="font-medium text-ink-50">შეტყობინება გაიგზავნა!</p>
                <p className="text-sm text-ink-400">მადლობა, ჩვენ მალე დაგიკავშირდებით.</p>
              </div>
            ) : (
              <form action={action} className="flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-name">სახელი</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder="გიორგი მამულაშვილი"
                    autoComplete="name"
                    aria-invalid={!!fieldError('name')}
                    disabled={isPending}
                  />
                  {fieldError('name') && (
                    <p className="text-xs text-destructive">{fieldError('name')}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-email">ელ-ფოსტა</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="yourname@example.com"
                    autoComplete="email"
                    aria-invalid={!!fieldError('email')}
                    disabled={isPending}
                  />
                  {fieldError('email') && (
                    <p className="text-xs text-destructive">{fieldError('email')}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-message">შეტყობინება</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="დაწერეთ თქვენი კითხვა ან წინადადება..."
                    rows={4}
                    aria-invalid={!!fieldError('message')}
                    disabled={isPending}
                  />
                  {fieldError('message') && (
                    <p className="text-xs text-destructive">{fieldError('message')}</p>
                  )}
                </div>

                {state.status === 'error' && (
                  <p className="text-sm text-destructive">{state.message}</p>
                )}

                <Button type="submit" disabled={isPending} className="self-end">
                  {isPending ? 'იგზავნება...' : 'გაგზავნა'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
