// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

afterEach(cleanup);

vi.mock('@/components/icons', () => ({
  CheckCircleIcon: ({ className }: { className?: string }) => (
    <svg data-testid="check-icon" data-class={className} />
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar">{children}</span>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { ChatBubble } from '@/components/chat-bubble';

const SENT_AT = new Date('2026-05-26T10:30:00Z');

describe('ChatBubble — direction', () => {
  it('exposes direction="incoming" on the wrapper for received messages', () => {
    const { container } = render(<ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" />);
    expect(
      container.querySelector('[data-slot="chat-bubble"]')?.getAttribute('data-direction'),
    ).toBe('incoming');
  });

  it('exposes direction="outgoing" on the wrapper for sent messages', () => {
    const { container } = render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" />);
    expect(
      container.querySelector('[data-slot="chat-bubble"]')?.getAttribute('data-direction'),
    ).toBe('outgoing');
  });

  it('renders an avatar for incoming messages', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" senderName="Alice" />);
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('does not render an avatar for outgoing messages', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" />);
    expect(screen.queryByTestId('avatar')).toBeNull();
  });
});

describe('ChatBubble — message body and time', () => {
  it('renders the message text', () => {
    render(<ChatBubble message="გამარჯობა" sentAt={SENT_AT} direction="incoming" />);
    expect(screen.getByText('გამარჯობა')).toBeTruthy();
  });

  it('renders an ISO-encoded time element', () => {
    const { container } = render(<ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" />);
    const time = container.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe(SENT_AT.toISOString());
  });
});

describe('ChatBubble — read receipt status', () => {
  it('renders no status icons when direction is incoming, regardless of status', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" status="read" />);
    expect(screen.queryByTestId('check-icon')).toBeNull();
  });

  it('renders a single check for outgoing "sent" status', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" status="sent" />);
    expect(screen.getAllByTestId('check-icon')).toHaveLength(1);
  });

  it('renders double checks for outgoing "delivered" status', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" status="delivered" />);
    expect(screen.getAllByTestId('check-icon')).toHaveLength(2);
  });

  it('renders double checks for outgoing "read" status', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" status="read" />);
    expect(screen.getAllByTestId('check-icon')).toHaveLength(2);
  });

  it('renders no status icon when outgoing without a status', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="outgoing" />);
    expect(screen.queryByTestId('check-icon')).toBeNull();
  });
});

describe('ChatBubble — sender info', () => {
  it('renders sender initials in fallback when no logo provided', () => {
    render(
      <ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" senderName="Alice Smith" />,
    );
    expect(screen.getByTestId('avatar-fallback').textContent).toBe('AL');
  });

  it('renders an avatar image when senderLogoUrl is provided', () => {
    render(
      <ChatBubble
        message="hi"
        sentAt={SENT_AT}
        direction="incoming"
        senderName="Alice"
        senderLogoUrl="https://cdn/logo.png"
      />,
    );
    expect(screen.getByTestId('avatar-image').getAttribute('src')).toBe('https://cdn/logo.png');
  });

  it('shows a placeholder fallback when no sender name is provided', () => {
    render(<ChatBubble message="hi" sentAt={SENT_AT} direction="incoming" />);
    expect(screen.getByTestId('avatar-fallback').textContent).toBe('·');
  });
});
