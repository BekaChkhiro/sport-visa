// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { HowItWorks } from '@/components/how-it-works';

describe('HowItWorks', () => {
  it('renders section heading', () => {
    render(<HowItWorks />);
    expect(screen.getByText('როგორ მუშაობს')).toBeDefined();
  });

  it('renders all three step numbers', () => {
    render(<HowItWorks />);
    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('02')).toBeDefined();
    expect(screen.getByText('03')).toBeDefined();
  });

  it('renders all step titles', () => {
    render(<HowItWorks />);
    expect(screen.getByText('შექმენი პროფილი')).toBeDefined();
    expect(screen.getByText('იპოვე კლუბი ან მოთამაშე')).toBeDefined();
    expect(screen.getByText('დაუკავშირდი')).toBeDefined();
  });

  it('renders all step descriptions', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/ატვირთე ფოტო/)).toBeDefined();
    expect(screen.getByText(/გაფილტრე კლუბები/)).toBeDefined();
    expect(screen.getByText(/გამოაგზავნე სერვისის/)).toBeDefined();
  });

  it('renders three step cards', () => {
    const { container } = render(<HowItWorks />);
    const steps = container.querySelectorAll('.relative.flex.flex-col.items-center');
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });

  it('renders subheading text', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/სამი მარტივი ნაბიჯი/)).toBeDefined();
  });
});
