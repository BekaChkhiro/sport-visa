// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { ErrorState } from '@/components/ui/error-state';

describe('ErrorState', () => {
  it('renders default title', () => {
    render(<ErrorState />);
    expect(screen.getByText('შეცდომა მოხდა')).toBeDefined();
  });

  it('renders default description', () => {
    render(<ErrorState />);
    expect(screen.getByText('მონაცემების ჩატვირთვა ვერ მოხდა. ცადეთ თავიდან.')).toBeDefined();
  });

  it('renders custom title', () => {
    render(<ErrorState title="Custom error" />);
    expect(screen.getByText('Custom error')).toBeDefined();
  });

  it('renders custom description', () => {
    render(<ErrorState description="Something went wrong." />);
    expect(screen.getByText('Something went wrong.')).toBeDefined();
  });

  it('renders action when provided', () => {
    render(<ErrorState action={<button>Retry</button>} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
  });

  it('page variant adds min-height class', () => {
    const { container } = render(<ErrorState variant="page" />);
    expect((container.firstChild as HTMLElement).className).toContain('min-h-');
  });

  it('inline variant is the default', () => {
    const { container } = render(<ErrorState />);
    expect((container.firstChild as HTMLElement).className).not.toContain('min-h-');
  });
});
