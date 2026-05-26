// @vitest-environment happy-dom
import type { Channel } from 'pusher-js';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type FakeChannel = Channel & {
  bind: ReturnType<typeof vi.fn>;
  unbind: ReturnType<typeof vi.fn>;
};

const mockSubscribe = vi.hoisted(() => vi.fn());
const mockUnsubscribe = vi.hoisted(() => vi.fn());

vi.mock('@/lib/pusher-client', () => ({
  getPusherClient: () => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  }),
}));

import { usePusherChannel, usePusherEvent } from '@/hooks/use-pusher-channel';

function makeChannel(): FakeChannel {
  return { bind: vi.fn(), unbind: vi.fn() } as unknown as FakeChannel;
}

beforeEach(() => {
  mockSubscribe.mockReset();
  mockUnsubscribe.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePusherChannel', () => {
  it('subscribes to the named channel on mount', () => {
    const channel = makeChannel();
    mockSubscribe.mockReturnValue(channel);

    const { result } = renderHook(() => usePusherChannel('private-chat.a.b'));
    expect(mockSubscribe).toHaveBeenCalledWith('private-chat.a.b');
    expect(result.current).toBe(channel);
  });

  it('unsubscribes on unmount', () => {
    mockSubscribe.mockReturnValue(makeChannel());
    const { unmount } = renderHook(() => usePusherChannel('private-chat.a.b'));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledWith('private-chat.a.b');
  });

  it('returns null and skips subscribe when channelName is null', () => {
    const { result } = renderHook(() => usePusherChannel(null));
    expect(result.current).toBeNull();
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('returns null and skips subscribe when channelName is undefined', () => {
    const { result } = renderHook(() => usePusherChannel(undefined));
    expect(result.current).toBeNull();
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('re-subscribes when the channel name changes', () => {
    mockSubscribe.mockImplementation(() => makeChannel());
    const { rerender } = renderHook(({ name }) => usePusherChannel(name), {
      initialProps: { name: 'chan-a' },
    });
    rerender({ name: 'chan-b' });
    expect(mockUnsubscribe).toHaveBeenCalledWith('chan-a');
    expect(mockSubscribe).toHaveBeenCalledWith('chan-b');
  });
});

describe('usePusherEvent', () => {
  it('does nothing when the channel is null', () => {
    const handler = vi.fn();
    renderHook(() => usePusherEvent(null, 'new-message', handler));
    expect(handler).not.toHaveBeenCalled();
  });

  it('binds the event handler to the channel', () => {
    const channel = makeChannel();
    renderHook(() => usePusherEvent(channel, 'new-message', vi.fn()));
    expect(channel.bind).toHaveBeenCalledWith('new-message', expect.any(Function));
  });

  it('invokes the latest handler when the event fires', () => {
    const channel = makeChannel();
    let captured: ((data: unknown) => void) | undefined;
    channel.bind.mockImplementation((_event: string, fn: (data: unknown) => void) => {
      captured = fn;
    });
    const handler = vi.fn();
    renderHook(() => usePusherEvent(channel, 'new-message', handler));
    captured?.({ id: 'm1' });
    expect(handler).toHaveBeenCalledWith({ id: 'm1' });
  });

  it('uses the latest handler even after a re-render without rebinding', () => {
    const channel = makeChannel();
    let captured: ((data: unknown) => void) | undefined;
    channel.bind.mockImplementation((_event: string, fn: (data: unknown) => void) => {
      captured = fn;
    });
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const { rerender } = renderHook(({ h }) => usePusherEvent(channel, 'evt', h), {
      initialProps: { h: handlerA },
    });
    rerender({ h: handlerB });
    captured?.({ id: 'x' });
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalledWith({ id: 'x' });
    expect(channel.bind).toHaveBeenCalledTimes(1);
  });

  it('unbinds the handler when the channel changes or on unmount', () => {
    const channel = makeChannel();
    const { unmount } = renderHook(() => usePusherEvent(channel, 'evt', vi.fn()));
    unmount();
    expect(channel.unbind).toHaveBeenCalledWith('evt', expect.any(Function));
  });
});
