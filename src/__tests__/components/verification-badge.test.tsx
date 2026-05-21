// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { VerificationBadge } from '@/components/verification-badge';

describe('VerificationBadge', () => {
  it('renders verified label', () => {
    render(<VerificationBadge status="verified" />);
    expect(screen.getByText('ვერიფიცირებული')).toBeDefined();
  });

  it('renders pending label', () => {
    render(<VerificationBadge status="pending" />);
    expect(screen.getByText('განხ. მოლოდინი')).toBeDefined();
  });

  it('renders rejected label', () => {
    render(<VerificationBadge status="rejected" />);
    expect(screen.getByText('უარყოფილი')).toBeDefined();
  });

  it('sets data-status attribute', () => {
    const { container } = render(<VerificationBadge status="verified" />);
    const el = container.querySelector('[data-slot="verification-badge"]');
    expect(el?.getAttribute('data-status')).toBe('verified');
  });

  it('hides label text when showLabel is false', () => {
    render(<VerificationBadge status="verified" showLabel={false} />);
    expect(screen.queryByText('ვერიფიცირებული')).toBeNull();
  });

  it('sets aria-label when showLabel is false', () => {
    const { container } = render(<VerificationBadge status="verified" showLabel={false} />);
    const el = container.querySelector('[data-slot="verification-badge"]');
    expect(el?.getAttribute('aria-label')).toBe('ვერიფიცირებული');
  });

  it('shows label text when showLabel is true (default)', () => {
    render(<VerificationBadge status="pending" showLabel />);
    expect(screen.getByText('განხ. მოლოდინი')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<VerificationBadge status="rejected" className="custom-badge" />);
    const el = container.querySelector('[data-slot="verification-badge"]');
    expect((el as HTMLElement).className).toContain('custom-badge');
  });
});
