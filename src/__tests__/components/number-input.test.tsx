// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NumberInput } from '@/components/ui/number-input';

afterEach(cleanup);

describe('NumberInput', () => {
  it('renders a numeric input', () => {
    const { container } = render(<NumberInput />);
    expect(container.querySelector('input[type="number"]')).not.toBeNull();
  });

  it('displays initial value', () => {
    const { container } = render(<NumberInput value={42} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('shows empty string for null value', () => {
    const { container } = render(<NumberInput value={null} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('calls onChange with parsed number on blur', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('calls onChange with null when cleared', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={10} onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('increment button has correct aria-label', () => {
    const { container } = render(<NumberInput />);
    const btns = container.querySelectorAll('button');
    const incBtn = Array.from(btns).find((b) => b.getAttribute('aria-label') === 'გაზრდა');
    expect(incBtn).not.toBeUndefined();
  });

  it('decrement button has correct aria-label', () => {
    const { container } = render(<NumberInput />);
    const btns = container.querySelectorAll('button');
    const decBtn = Array.from(btns).find((b) => b.getAttribute('aria-label') === 'შემცირება');
    expect(decBtn).not.toBeUndefined();
  });

  it('clamps value to max on blur', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput max={10} onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('clamps value to min on blur', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput min={5} onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('renders with data-slot attribute', () => {
    const { container } = render(<NumberInput />);
    expect(container.querySelector('[data-slot="number-input"]')).not.toBeNull();
  });
});
