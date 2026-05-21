// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProfileCompletionBanner } from '@/components/profile-completion-banner';

afterEach(cleanup);

const baseProps = {
  percent: 70,
  onComplete: vi.fn(),
  onDismiss: vi.fn(),
};

describe('ProfileCompletionBanner', () => {
  it('renders when percent is below 100', () => {
    render(<ProfileCompletionBanner {...baseProps} />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('returns null when percent is 100', () => {
    const { container } = render(<ProfileCompletionBanner {...baseProps} percent={100} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when percent exceeds 100', () => {
    const { container } = render(<ProfileCompletionBanner {...baseProps} percent={120} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays the correct percentage', () => {
    render(<ProfileCompletionBanner {...baseProps} percent={55} />);
    expect(screen.getByText('პროფილი 55% შესრულდა')).toBeDefined();
  });

  it('clamps negative percent to 0', () => {
    render(<ProfileCompletionBanner {...baseProps} percent={-10} />);
    expect(screen.getByText('პროფილი 0% შესრულდა')).toBeDefined();
  });

  it('shows missing fields when provided', () => {
    render(<ProfileCompletionBanner {...baseProps} missingFields={['ფოტო', 'ბიო']} />);
    expect(screen.getByText(/ფოტო/)).toBeDefined();
    expect(screen.getByText(/ბიო/)).toBeDefined();
  });

  it('calls onComplete when complete button is clicked', () => {
    const onComplete = vi.fn();
    render(<ProfileCompletionBanner {...baseProps} onComplete={onComplete} />);
    const btn = screen.getByRole('button', { name: /პროფ/ });
    fireEvent.click(btn);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ProfileCompletionBanner {...baseProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'დახურვა' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('applies custom className', () => {
    const { container } = render(<ProfileCompletionBanner {...baseProps} className="my-banner" />);
    expect((container.firstChild as HTMLElement).className).toContain('my-banner');
  });
});
