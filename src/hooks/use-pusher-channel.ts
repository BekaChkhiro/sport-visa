'use client';

import type { Channel } from 'pusher-js';
import { useEffect, useRef, useState } from 'react';

import { getPusherClient } from '@/lib/pusher-client';

/**
 * Subscribe to a Pusher channel for the lifetime of the component.
 * Returns the Channel instance so callers can bind additional events.
 * Pass `null` or `undefined` as `channelName` to skip subscription.
 */
export function usePusherChannel(channelName: string | null | undefined): Channel | null {
  const [channel, setChannel] = useState<Channel | null>(null);
  // Stable ref so the cleanup closure always sees the latest channel.
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const client = getPusherClient();
    const ch = client.subscribe(channelName);
    channelRef.current = ch;
    setChannel(ch);

    return () => {
      client.unsubscribe(channelName);
      channelRef.current = null;
      setChannel(null);
    };
  }, [channelName]);

  return channel;
}

/**
 * Subscribe to a specific event on a Pusher channel.
 * The handler is stable-ref-wrapped so callers don't need to memoize it.
 */
export function usePusherEvent<T = unknown>(
  channel: Channel | null,
  event: string,
  handler: (data: T) => void,
): void {
  // Keep a ref to the latest handler so we don't unbind/rebind on every render.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!channel) return;

    const stable = (data: T) => handlerRef.current(data);
    channel.bind(event, stable);

    return () => {
      channel.unbind(event, stable);
    };
  }, [channel, event]);
}
