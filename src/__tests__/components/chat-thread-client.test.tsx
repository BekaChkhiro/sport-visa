// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

afterEach(cleanup);

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ signOut: vi.fn().mockResolvedValue(undefined) }));

vi.mock('@/components/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock('@/components/icons', () => ({
  ArrowLeftIcon: () => <svg data-testid="back-icon" />,
  ExternalLinkIcon: () => <svg data-testid="ext-icon" />,
  SendIcon: () => <svg data-testid="send-icon" />,
  SpinnerIcon: () => <svg data-testid="spinner-icon" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type = 'button',
    asChild,
    disabled,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    asChild?: boolean;
    disabled?: boolean;
    'aria-label'?: string;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return (
      <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
        {children}
      </button>
    );
  },
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => <textarea {...props} />,
}));

vi.mock('@/components/profile-avatar', () => ({
  ProfileAvatar: ({ fallback }: { fallback: string }) => (
    <span data-testid="avatar">{fallback}</span>
  ),
}));

vi.mock('@/components/chat-bubble', () => ({
  ChatBubble: ({ message, direction }: { message: string; direction: string }) => (
    <div data-testid="chat-bubble" data-direction={direction}>
      {message}
    </div>
  ),
}));

vi.mock('@/hooks/use-pusher-channel', () => ({
  usePusherChannel: () => null,
  usePusherEvent: () => undefined,
}));

vi.mock('@/lib/pusher-client', () => ({
  channels: {
    chat: (a: string, b: string) => `private-chat.${[a, b].sort().join('.')}`,
  },
  events: { NEW_MESSAGE: 'new-message' },
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { ChatThreadClient } from '@/app/chat/[conversationId]/thread-client';
import type { ChatThreadMessage } from '@/app/chat/[conversationId]/thread-client';

const BASE_USER = { name: 'FC Dila', initials: 'FD' };
const BASE_CONVERSATION = {
  id: 'conv-1',
  clubUserId: 'club-user',
  footballerUserId: 'fb-user',
  otherName: 'Irakli B.',
  otherInitials: 'IB',
  otherProfileHref: '/directory/fb-1',
};

const INCOMING: ChatThreadMessage = {
  id: 'm1',
  senderUserId: 'fb-user',
  body: 'გამარჯობა',
  createdAt: new Date('2026-05-26T09:00:00Z').toISOString(),
  read: true,
};

const OUTGOING: ChatThreadMessage = {
  id: 'm2',
  senderUserId: 'club-user',
  body: 'მოგესალმები!',
  createdAt: new Date('2026-05-26T09:01:00Z').toISOString(),
  read: false,
};

function renderClient(messages: ChatThreadMessage[] = []) {
  return render(
    <ChatThreadClient
      currentPath="/chats"
      userId="club-user"
      role="club"
      user={BASE_USER}
      conversation={BASE_CONVERSATION}
      initialMessages={messages}
    />,
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChatThreadClient — initial render', () => {
  it('shows the other participant name in the header', () => {
    renderClient();
    expect(screen.getByText('Irakli B.')).toBeTruthy();
  });

  it('shows the empty state when there are no messages', () => {
    renderClient();
    expect(screen.getByText('ჯერ შეტყობინებები არ არის.')).toBeTruthy();
  });

  it('renders incoming and outgoing bubbles with correct direction', () => {
    renderClient([INCOMING, OUTGOING]);
    const bubbles = screen.getAllByTestId('chat-bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]?.getAttribute('data-direction')).toBe('incoming');
    expect(bubbles[1]?.getAttribute('data-direction')).toBe('outgoing');
  });
});

describe('ChatThreadClient — send button enablement', () => {
  it('disables the send button when the draft is empty', () => {
    renderClient();
    const sendBtn = screen.getByRole('button', { name: 'გაგზავნა' });
    expect((sendBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables the send button once the draft has content', () => {
    renderClient();
    const textarea = screen.getByLabelText('შეტყობინების ტექსტი');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    const sendBtn = screen.getByRole('button', { name: 'გაგზავნა' });
    expect((sendBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables send and shows over-limit hint when draft exceeds 2000 chars', () => {
    renderClient();
    const textarea = screen.getByLabelText('შეტყობინების ტექსტი');
    fireEvent.change(textarea, { target: { value: 'x'.repeat(2001) } });
    const sendBtn = screen.getByRole('button', { name: 'გაგზავნა' });
    expect((sendBtn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/ლიმიტს ზემოთ/)).toBeTruthy();
  });
});

describe('ChatThreadClient — send flow', () => {
  it('POSTs the body to the messages endpoint and appends the returned message', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          id: 'new-1',
          senderUserId: 'club-user',
          body: 'ახალი',
          createdAt: new Date().toISOString(),
          read: false,
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderClient();
    const textarea = screen.getByLabelText('შეტყობინების ტექსტი') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'ახალი' } });
    fireEvent.click(screen.getByRole('button', { name: 'გაგზავნა' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/conversations/conv-1/messages',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'ახალი' }),
      }),
    );
    await waitFor(() => expect(textarea.value).toBe(''));
    expect(screen.getByText('ახალი')).toBeTruthy();
  });

  it('shows the server error message when the request fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Conversation not found' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderClient();
    fireEvent.change(screen.getByLabelText('შეტყობინების ტექსტი'), {
      target: { value: 'hi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'გაგზავნა' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('Conversation not found');
  });

  it('falls back to a generic error message when the response body is not JSON', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('not json');
      },
    });
    vi.stubGlobal('fetch', mockFetch);

    renderClient();
    fireEvent.change(screen.getByLabelText('შეტყობინების ტექსტი'), {
      target: { value: 'hi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'გაგზავნა' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('შეტყობინების გაგზავნა ვერ მოხერხდა');
  });

  it('submits on Enter and inserts a newline on Shift+Enter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          id: 'new-1',
          senderUserId: 'club-user',
          body: 'hi',
          createdAt: new Date().toISOString(),
          read: false,
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderClient();
    const textarea = screen.getByLabelText('შეტყობინების ტექსტი') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'hi' } });

    // Shift+Enter must NOT trigger send.
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(mockFetch).not.toHaveBeenCalled();

    // Enter alone triggers send.
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });

  it('does not send whitespace-only drafts', () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    renderClient();
    fireEvent.change(screen.getByLabelText('შეტყობინების ტექსტი'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'გაგზავნა' }));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
