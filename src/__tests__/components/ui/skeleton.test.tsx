// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonListItem,
  SkeletonStatStrip,
  SkeletonText,
} from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="w-32 h-4" />);
    expect((container.firstChild as HTMLElement).className).toContain('w-32');
  });
});

describe('SkeletonAvatar', () => {
  it('renders a rounded-full skeleton', () => {
    const { container } = render(<SkeletonAvatar />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
  });
});

describe('SkeletonText', () => {
  it('renders 2 lines by default', () => {
    const { container } = render(<SkeletonText />);
    expect(container.querySelectorAll('[class*="animate-pulse"]')).toHaveLength(2);
  });

  it('renders the specified number of lines', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('[class*="animate-pulse"]')).toHaveLength(4);
  });

  it('last line of multi-line text is narrower (w-4/5)', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const items = container.querySelectorAll('[class*="animate-pulse"]');
    expect((items[items.length - 1] as HTMLElement).className).toContain('w-4/5');
  });
});

describe('SkeletonCard', () => {
  it('renders an avatar and text skeletons', () => {
    const { container } = render(<SkeletonCard />);
    const pulses = container.querySelectorAll('[class*="animate-pulse"]');
    expect(pulses.length).toBeGreaterThan(2);
  });
});

describe('SkeletonListItem', () => {
  it('renders without error', () => {
    const { container } = render(<SkeletonListItem />);
    expect(container.firstChild).toBeDefined();
  });
});

describe('SkeletonStatStrip', () => {
  it('renders 3 stat skeletons', () => {
    const { container } = render(<SkeletonStatStrip />);
    const cols = container.querySelectorAll('[class*="flex-col"]');
    expect(cols.length).toBeGreaterThanOrEqual(3);
  });
});
