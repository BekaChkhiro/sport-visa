// @vitest-environment happy-dom
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

afterEach(cleanup);

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    'aria-pressed'?: boolean;
    className?: string;
  }) => (
    <button
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/icons', () => ({
  HeartIcon: ({ className }: { className?: string }) => (
    <svg data-testid="heart-icon" className={className} />
  ),
  MessageCircleIcon: ({ className }: { className?: string }) => (
    <svg data-testid="message-icon" className={className} />
  ),
}));

vi.mock('@/lib/format-relative-time', () => ({
  formatRelativeTime: () => '2 საათის წინ',
}));

vi.mock('@/lib/utils', () => ({ cn: (...c: unknown[]) => c.filter(Boolean).join(' ') }));

import { NewsfeedCard } from '@/components/newsfeed-card';

const BASE_PROPS = {
  clubName: 'FC Dinamo',
  postedAt: new Date('2026-05-25T12:00:00Z'),
  title: 'Season Opener Results',
  likeCount: 42,
  commentCount: 7,
  isLiked: false,
  onLikeToggle: vi.fn(),
};

describe('NewsfeedCard — content rendering', () => {
  it('renders club name', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.getByText('FC Dinamo')).toBeTruthy();
  });

  it('renders post title', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.getByText('Season Opener Results')).toBeTruthy();
  });

  it('renders excerpt when provided', () => {
    render(<NewsfeedCard {...BASE_PROPS} excerpt="A short excerpt here." />);
    expect(screen.getByText('A short excerpt here.')).toBeTruthy();
  });

  it('does not render excerpt element when omitted', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.queryByText('A short excerpt here.')).toBeNull();
  });

  it('renders formatted relative time', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.getByText('2 საათის წინ')).toBeTruthy();
  });

  it('renders like count', () => {
    render(<NewsfeedCard {...BASE_PROPS} likeCount={42} />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders comment count', () => {
    render(<NewsfeedCard {...BASE_PROPS} commentCount={7} />);
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('renders club avatar fallback initials (first 2 chars uppercase)', () => {
    render(<NewsfeedCard {...BASE_PROPS} clubName="FC Dinamo" />);
    expect(screen.getByText('FC')).toBeTruthy();
  });

  it('renders club logo image when clubLogoUrl is provided', () => {
    render(<NewsfeedCard {...BASE_PROPS} clubLogoUrl="https://example.com/logo.png" />);
    const img = screen.getByRole('img', { name: 'FC Dinamo' });
    expect(img.getAttribute('src')).toBe('https://example.com/logo.png');
  });

  it('renders post image when imageUrl is provided', () => {
    render(<NewsfeedCard {...BASE_PROPS} imageUrl="https://example.com/post.jpg" />);
    const img = screen.getByAltText('');
    expect(img.getAttribute('src')).toBe('https://example.com/post.jpg');
  });

  it('does not render post image when imageUrl is not provided', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.queryByAltText('')).toBeNull();
  });
});

describe('NewsfeedCard — like button', () => {
  it('has aria-pressed=false when not liked', () => {
    render(<NewsfeedCard {...BASE_PROPS} isLiked={false} />);
    const btn = screen.getByRole('button', { name: 'მოწონება' });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('has aria-pressed=true and correct aria-label when liked', () => {
    render(<NewsfeedCard {...BASE_PROPS} isLiked={true} />);
    const btn = screen.getByRole('button', { name: 'მოწონების გაუქმება' });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onLikeToggle with true when not liked and button is clicked', () => {
    const onLikeToggle = vi.fn();
    render(<NewsfeedCard {...BASE_PROPS} isLiked={false} onLikeToggle={onLikeToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'მოწონება' }));
    expect(onLikeToggle).toHaveBeenCalledWith(true);
  });

  it('calls onLikeToggle with false when already liked and button is clicked', () => {
    const onLikeToggle = vi.fn();
    render(<NewsfeedCard {...BASE_PROPS} isLiked={true} onLikeToggle={onLikeToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'მოწონების გაუქმება' }));
    expect(onLikeToggle).toHaveBeenCalledWith(false);
  });
});

describe('NewsfeedCard — comment button', () => {
  it('renders comment button with correct aria-label', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(screen.getByRole('button', { name: 'კომენტარები' })).toBeTruthy();
  });

  it('calls onCommentClick when comment button is clicked', () => {
    const onCommentClick = vi.fn();
    render(<NewsfeedCard {...BASE_PROPS} onCommentClick={onCommentClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'კომენტარები' }));
    expect(onCommentClick).toHaveBeenCalledOnce();
  });

  it('does not throw when onCommentClick is not provided', () => {
    render(<NewsfeedCard {...BASE_PROPS} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'კომენტარები' }));
    }).not.toThrow();
  });
});
