// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders the required title', () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText('No results found')).toBeDefined();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try adjusting your filters." />);
    expect(screen.getByText('Try adjusting your filters.')).toBeDefined();
  });

  it('omits description element when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/Try/)).toBeNull();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="Empty" action={<button>Add item</button>} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeDefined();
  });

  it('renders icon slot when icon is provided', () => {
    render(<EmptyState title="Empty" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Empty" className="custom-class" />);
    expect((container.firstChild as HTMLElement).className).toContain('custom-class');
  });
});
