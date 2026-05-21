// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PositionChip, VALID_POSITIONS } from '@/components/position-chip';

afterEach(cleanup);

describe('VALID_POSITIONS', () => {
  it('contains standard football positions', () => {
    expect(VALID_POSITIONS).toContain('GK');
    expect(VALID_POSITIONS).toContain('CB');
    expect(VALID_POSITIONS).toContain('CM');
    expect(VALID_POSITIONS).toContain('ST');
  });

  it('has 11 positions', () => {
    expect(VALID_POSITIONS).toHaveLength(11);
  });
});

describe('PositionChip', () => {
  it('renders the position label', () => {
    render(<PositionChip position="CM" />);
    expect(screen.getByText('CM')).toBeDefined();
  });

  it('renders as a span when no onClick is provided', () => {
    const { container } = render(<PositionChip position="GK" />);
    expect(container.querySelector('span[data-slot="position-chip"]')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders as a button element when onClick is provided', () => {
    const { container } = render(<PositionChip position="ST" onClick={() => {}} />);
    expect(container.querySelector('button[data-slot="position-chip"]')).not.toBeNull();
  });

  it('calls onClick when the chip is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(<PositionChip position="LW" onClick={handleClick} />);
    fireEvent.click(container.querySelector('button')!);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('sets data-selected="true" when selected', () => {
    const { container } = render(<PositionChip position="CM" selected onClick={() => {}} />);
    const chip = container.querySelector('[data-slot="position-chip"]');
    expect(chip?.getAttribute('data-selected')).toBe('true');
  });

  it('sets data-selected="false" when not selected', () => {
    const { container } = render(<PositionChip position="CM" onClick={() => {}} />);
    const chip = container.querySelector('[data-slot="position-chip"]');
    expect(chip?.getAttribute('data-selected')).toBe('false');
  });

  it('is disabled when disabled prop is set', () => {
    const { container } = render(<PositionChip position="DM" onClick={() => {}} disabled />);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(<PositionChip position="CB" className="my-chip" />);
    const chip = container.querySelector('[data-slot="position-chip"]');
    expect((chip as HTMLElement).className).toContain('my-chip');
  });
});
