// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('@/lib/contact/actions', () => ({
  submitContact: vi.fn(),
}));

const mockUseActionState = vi.fn();
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { Contact } from '@/components/contact';

const mockAction = vi.fn();

beforeEach(() => {
  mockUseActionState.mockImplementation((_action: unknown, initialState: unknown) => [
    initialState,
    mockAction,
    false,
  ]);
});

describe('Contact — idle state', () => {
  it('renders section heading', () => {
    render(<Contact />);
    expect(screen.getByText('დაგვიკავშირდით')).toBeDefined();
  });

  it('renders all form fields', () => {
    render(<Contact />);
    expect(screen.getByLabelText('სახელი')).toBeDefined();
    expect(screen.getByLabelText('ელ-ფოსტა')).toBeDefined();
    expect(screen.getByLabelText('შეტყობინება')).toBeDefined();
  });

  it('renders submit button', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: 'გაგზავნა' })).toBeDefined();
  });

  it('renders contact email address', () => {
    render(<Contact />);
    expect(screen.getByText('info@sportvisa.ge')).toBeDefined();
  });

  it('submit button is enabled when not pending', () => {
    render(<Contact />);
    const btn = screen.getByRole('button', { name: 'გაგზავნა' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});

describe('Contact — pending state', () => {
  beforeEach(() => {
    mockUseActionState.mockImplementation((_action: unknown, initialState: unknown) => [
      initialState,
      mockAction,
      true,
    ]);
  });

  it('shows loading label when pending', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: 'იგზავნება...' })).toBeDefined();
  });

  it('disables submit button when pending', () => {
    render(<Contact />);
    const btn = screen.getByRole('button', { name: 'იგზავნება...' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('disables name input when pending', () => {
    render(<Contact />);
    const input = screen.getByLabelText('სახელი') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});

describe('Contact — validation state', () => {
  it('shows name validation error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'validation', errors: { name: ['სახელი ძალიან მოკლეა'] } },
      mockAction,
      false,
    ]);
    render(<Contact />);
    expect(screen.getByText('სახელი ძალიან მოკლეა')).toBeDefined();
  });

  it('shows email validation error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'validation', errors: { email: ['არასწორი ელ-ფოსტა'] } },
      mockAction,
      false,
    ]);
    render(<Contact />);
    expect(screen.getByText('არასწორი ელ-ფოსტა')).toBeDefined();
  });

  it('shows message validation error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'validation', errors: { message: ['შეტყობინება ძალიან მოკლეა'] } },
      mockAction,
      false,
    ]);
    render(<Contact />);
    expect(screen.getByText('შეტყობინება ძალიან მოკლეა')).toBeDefined();
  });

  it('marks name field as aria-invalid on validation error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'validation', errors: { name: ['სახელი ძალიან მოკლეა'] } },
      mockAction,
      false,
    ]);
    render(<Contact />);
    const input = screen.getByLabelText('სახელი') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('marks email field as aria-invalid on validation error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'validation', errors: { email: ['არასწორი ელ-ფოსტა'] } },
      mockAction,
      false,
    ]);
    render(<Contact />);
    const input = screen.getByLabelText('ელ-ფოსტა') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Contact — success state', () => {
  beforeEach(() => {
    mockUseActionState.mockReturnValue([{ status: 'success' }, mockAction, false]);
  });

  it('shows success heading', () => {
    render(<Contact />);
    expect(screen.getByText('შეტყობინება გაიგზავნა!')).toBeDefined();
  });

  it('shows thank-you message', () => {
    render(<Contact />);
    expect(screen.getByText(/მადლობა/)).toBeDefined();
  });

  it('hides the form on success', () => {
    render(<Contact />);
    expect(screen.queryByRole('button', { name: 'გაგზავნა' })).toBeNull();
  });

  it('hides form fields on success', () => {
    render(<Contact />);
    expect(screen.queryByLabelText('სახელი')).toBeNull();
  });
});

describe('Contact — error state', () => {
  it('shows error message', () => {
    mockUseActionState.mockReturnValue([
      { status: 'error', message: 'გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.' },
      mockAction,
      false,
    ]);
    render(<Contact />);
    expect(screen.getByText('გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.')).toBeDefined();
  });

  it('still shows form fields on error', () => {
    mockUseActionState.mockReturnValue([
      { status: 'error', message: 'შეცდომა' },
      mockAction,
      false,
    ]);
    render(<Contact />);
    expect(screen.getByLabelText('სახელი')).toBeDefined();
  });
});
