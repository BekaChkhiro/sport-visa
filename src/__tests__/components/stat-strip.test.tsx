// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { StatStrip } from '@/components/stat-strip';

const stats = [
  { label: 'Views', value: '348' },
  { label: 'Saves', value: '5' },
  { label: 'Messages', value: '2' },
];

describe('StatStrip', () => {
  it('renders all stat values', () => {
    render(<StatStrip stats={stats} />);
    expect(screen.getByText('348')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('renders all stat labels', () => {
    render(<StatStrip stats={stats} />);
    expect(screen.getByText('Views')).toBeDefined();
    expect(screen.getByText('Saves')).toBeDefined();
    expect(screen.getByText('Messages')).toBeDefined();
  });

  it('renders the correct number of stat cells', () => {
    const { container } = render(<StatStrip stats={stats} />);
    // Each stat is a div with flex-col — 3 stats means 3 such divs
    const cells = container.querySelectorAll('[data-slot="stat-strip"] > div');
    expect(cells).toHaveLength(3);
  });

  it('sets data-slot attribute', () => {
    const { container } = render(<StatStrip stats={stats} />);
    expect(container.querySelector('[data-slot="stat-strip"]')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<StatStrip stats={stats} className="my-strip" />);
    const el = container.querySelector('[data-slot="stat-strip"]');
    expect((el as HTMLElement).className).toContain('my-strip');
  });

  it('renders a single stat correctly', () => {
    render(<StatStrip stats={[{ label: 'Score', value: '99' }]} />);
    expect(screen.getByText('Score')).toBeDefined();
    expect(screen.getByText('99')).toBeDefined();
  });
});
