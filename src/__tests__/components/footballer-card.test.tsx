// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FootballerCard } from '@/components/footballer-card';

afterEach(cleanup);

const baseProps = {
  id: 'f1',
  name: 'Giorgi Mikhelidze',
  position: 'CM',
  nationality: 'GEO',
  verificationStatus: 'verified' as const,
  isSaved: false,
  onSaveToggle: vi.fn(),
};

describe('FootballerCard', () => {
  it('renders footballer name', () => {
    render(<FootballerCard {...baseProps} />);
    expect(screen.getByText('Giorgi Mikhelidze')).toBeDefined();
  });

  it('renders position chip', () => {
    render(<FootballerCard {...baseProps} />);
    expect(screen.getByText('CM')).toBeDefined();
  });

  it('renders nationality', () => {
    render(<FootballerCard {...baseProps} />);
    expect(screen.getByText('GEO')).toBeDefined();
  });

  it('renders age and height when provided', () => {
    render(<FootballerCard {...baseProps} age={24} height={182} />);
    expect(screen.getByText(/24/)).toBeDefined();
    expect(screen.getByText(/182 სმ/)).toBeDefined();
  });

  it('renders a link to the detail page', () => {
    const { container } = render(<FootballerCard {...baseProps} />);
    const link = container.querySelector('a[href="/directory/f1"]');
    expect(link).not.toBeNull();
  });

  it('renders a custom href when provided', () => {
    const { container } = render(<FootballerCard {...baseProps} href="/custom/path" />);
    const link = container.querySelector('a[href="/custom/path"]');
    expect(link).not.toBeNull();
  });

  it('calls onSaveToggle with (id, true) when star button clicked and not saved', () => {
    const handleSaveToggle = vi.fn();
    render(<FootballerCard {...baseProps} isSaved={false} onSaveToggle={handleSaveToggle} />);
    const starBtn = screen.getByRole('button', { name: /შენახვა/i });
    fireEvent.click(starBtn);
    expect(handleSaveToggle).toHaveBeenCalledWith('f1', true);
  });

  it('calls onSaveToggle with (id, false) when star button clicked and already saved', () => {
    const handleSaveToggle = vi.fn();
    render(<FootballerCard {...baseProps} isSaved={true} onSaveToggle={handleSaveToggle} />);
    const starBtn = screen.getByRole('button', { name: /ჩამოშორება/i });
    fireEvent.click(starBtn);
    expect(handleSaveToggle).toHaveBeenCalledWith('f1', false);
  });

  it('star button aria-pressed reflects isSaved state', () => {
    const { rerender } = render(<FootballerCard {...baseProps} isSaved={false} />);
    expect(screen.getByRole('button', { name: /შენახვა/i }).getAttribute('aria-pressed')).toBe(
      'false',
    );

    rerender(<FootballerCard {...baseProps} isSaved={true} />);
    expect(screen.getByRole('button', { name: /ჩამოშორება/i }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('renders as an article element', () => {
    const { container } = render(<FootballerCard {...baseProps} />);
    expect(container.querySelector('article[data-slot="footballer-card"]')).not.toBeNull();
  });

  it('shows user icon placeholder when no photoUrl', () => {
    const { container } = render(<FootballerCard {...baseProps} photoUrl={undefined} />);
    // No img element present (Next Image requires a src)
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(0);
  });

  it('applies custom className', () => {
    const { container } = render(<FootballerCard {...baseProps} className="custom-class" />);
    expect(
      (container.querySelector('[data-slot="footballer-card"]') as HTMLElement).className,
    ).toContain('custom-class');
  });
});
