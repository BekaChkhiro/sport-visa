// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClubCard } from '@/components/club-card';

afterEach(cleanup);

const baseProps = {
  id: 'c1',
  name: 'FC Dinamo Tbilisi',
  country: 'GEO',
  verificationStatus: 'verified' as const,
  canSubscribe: false,
  isSubscribed: false,
  onSubscribeToggle: vi.fn(),
};

describe('ClubCard', () => {
  it('renders club name', () => {
    render(<ClubCard {...baseProps} />);
    expect(screen.getByText('FC Dinamo Tbilisi')).toBeDefined();
  });

  it('renders city and country when provided', () => {
    render(<ClubCard {...baseProps} city="Tbilisi" />);
    // meta paragraph contains "Tbilisi · GEO"
    expect(screen.getAllByText(/Tbilisi/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/GEO/).length).toBeGreaterThan(0);
  });

  it('renders league when provided', () => {
    render(<ClubCard {...baseProps} league="Erovnuli Liga" />);
    expect(screen.getByText(/Erovnuli Liga/)).toBeDefined();
  });

  it('renders founded year when provided', () => {
    render(<ClubCard {...baseProps} foundedYear={1925} />);
    expect(screen.getByText(/1925/)).toBeDefined();
  });

  it('renders a link to the club detail page', () => {
    const { container } = render(<ClubCard {...baseProps} />);
    const link = container.querySelector('a[href="/clubs/c1"]');
    expect(link).not.toBeNull();
  });

  it('renders a custom href when provided', () => {
    const { container } = render(<ClubCard {...baseProps} href="/custom/club" />);
    const link = container.querySelector('a[href="/custom/club"]');
    expect(link).not.toBeNull();
  });

  it('does not render subscribe button when canSubscribe is false', () => {
    render(<ClubCard {...baseProps} canSubscribe={false} />);
    expect(screen.queryByRole('button', { name: /გამოწ/i })).toBeNull();
  });

  it('renders subscribe button when canSubscribe is true', () => {
    render(<ClubCard {...baseProps} canSubscribe={true} isSubscribed={false} />);
    expect(screen.getByRole('button', { name: /გამოწ/i })).toBeDefined();
  });

  it('subscribe button shows subscribed state', () => {
    render(<ClubCard {...baseProps} canSubscribe={true} isSubscribed={true} />);
    const btn = screen.getByRole('button', { name: /გამოწ/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onSubscribeToggle with (id, true) when not subscribed', () => {
    const handleToggle = vi.fn();
    render(
      <ClubCard
        {...baseProps}
        canSubscribe={true}
        isSubscribed={false}
        onSubscribeToggle={handleToggle}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /გამოწ/i }));
    expect(handleToggle).toHaveBeenCalledWith('c1', true);
  });

  it('calls onSubscribeToggle with (id, false) when subscribed', () => {
    const handleToggle = vi.fn();
    render(
      <ClubCard
        {...baseProps}
        canSubscribe={true}
        isSubscribed={true}
        onSubscribeToggle={handleToggle}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /გამოწ/i }));
    expect(handleToggle).toHaveBeenCalledWith('c1', false);
  });

  it('renders as an article element', () => {
    const { container } = render(<ClubCard {...baseProps} />);
    expect(container.querySelector('article[data-slot="club-card"]')).not.toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<ClubCard {...baseProps} className="custom-club" />);
    expect((container.querySelector('[data-slot="club-card"]') as HTMLElement).className).toContain(
      'custom-club',
    );
  });

  it('renders a "ნახვა" link button', () => {
    render(<ClubCard {...baseProps} />);
    expect(screen.getByRole('link', { name: /ნახვა/i })).toBeDefined();
  });
});
