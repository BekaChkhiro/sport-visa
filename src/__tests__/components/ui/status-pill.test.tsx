// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { StatusPill } from '@/components/ui/status-pill';

describe('StatusPill', () => {
  it('renders default label for pending status', () => {
    render(<StatusPill status="pending" />);
    expect(screen.getByText('მოლოდინში')).toBeDefined();
  });

  it('renders default label for approved status', () => {
    render(<StatusPill status="approved" />);
    expect(screen.getByText('დადასტურდა')).toBeDefined();
  });

  it('renders default label for rejected status', () => {
    render(<StatusPill status="rejected" />);
    expect(screen.getByText('უარყოფილია')).toBeDefined();
  });

  it('renders custom children instead of default label', () => {
    render(<StatusPill status="pending">Custom label</StatusPill>);
    expect(screen.getByText('Custom label')).toBeDefined();
    expect(screen.queryByText('მოლოდინში')).toBeNull();
  });

  it('sets data-status attribute', () => {
    const { container } = render(<StatusPill status="approved" />);
    const el = container.querySelector('[data-slot="status-pill"]');
    expect(el?.getAttribute('data-status')).toBe('approved');
  });

  it('sets data-slot attribute', () => {
    const { container } = render(<StatusPill status="pending" />);
    expect(container.querySelector('[data-slot="status-pill"]')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<StatusPill status="pending" className="my-class" />);
    const el = container.querySelector('[data-slot="status-pill"]');
    expect((el as HTMLElement).className).toContain('my-class');
  });
});
