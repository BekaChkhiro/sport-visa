// @vitest-environment happy-dom
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

vi.mock('@/components/how-it-works', () => ({
  HowItWorks: () => <div data-testid="how-it-works" />,
}));
vi.mock('@/components/stat-strip', () => ({
  StatStrip: ({ stats }: { stats: { value: string; label: string }[] }) => (
    <div data-testid="stat-strip">
      {stats.map((s) => (
        <span key={s.label}>
          {s.value} {s.label}
        </span>
      ))}
    </div>
  ),
}));
vi.mock('@/components/testimonials', () => ({
  Testimonials: () => <div data-testid="testimonials" />,
}));
vi.mock('@/components/faq', () => ({
  FAQ: () => <div data-testid="faq" />,
}));
vi.mock('@/components/contact', () => ({
  Contact: () => <div data-testid="contact" />,
}));

import HomePage from '@/app/page';

describe('HomePage — hero section', () => {
  it('renders without crashing', () => {
    const { container } = render(<HomePage />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders h1 heading with brand name', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('Sport Visa')).toBeDefined();
  });

  it('renders footballer registration CTA link', () => {
    render(<HomePage />);
    expect(screen.getByText('ფეხბურთელად რეგისტრაცია')).toBeDefined();
  });

  it('footballer CTA links to signup with footballer role', () => {
    const { container } = render(<HomePage />);
    const link = container.querySelector('a[href="/auth/signup?role=footballer"]');
    expect(link).not.toBeNull();
  });

  it('renders club registration CTA link', () => {
    render(<HomePage />);
    expect(screen.getByText('კლუბად რეგისტრაცია')).toBeDefined();
  });

  it('club CTA links to signup with club role', () => {
    const { container } = render(<HomePage />);
    const link = container.querySelector('a[href="/auth/signup?role=club"]');
    expect(link).not.toBeNull();
  });

  it('renders hero taglines', () => {
    render(<HomePage />);
    expect(screen.getByText('ფეხბურთელები კლუბებს ენახებიან.')).toBeDefined();
    expect(screen.getByText('კლუბები ფეხბურთელებს პოულობენ.')).toBeDefined();
  });
});

describe('HomePage — features section', () => {
  it('renders features section heading', () => {
    render(<HomePage />);
    expect(screen.getByText('ძირითადი ფუნქციები')).toBeDefined();
  });

  it('renders all six feature card titles', () => {
    render(<HomePage />);
    expect(screen.getByText('ფეხბურთელის პროფილი')).toBeDefined();
    expect(screen.getByText('კლუბების დირექტორია')).toBeDefined();
    expect(screen.getByText('გაფართოებული ფილტრები')).toBeDefined();
    expect(screen.getByText('Real-time ჩატი')).toBeDefined();
    // "სერვისის მოთხოვნა" appears in both features grid and footballer list
    expect(screen.getAllByText('სერვისის მოთხოვნა').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('შენი სიმოკლე')).toBeDefined();
  });

  it('renders 6 feature headings (h3)', () => {
    render(<HomePage />);
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
  });
});

describe('HomePage — footballer section', () => {
  it('renders footballer section heading', () => {
    render(<HomePage />);
    expect(screen.getByText('ფეხბურთელისთვის')).toBeDefined();
  });

  it('renders footballer CTA "დაიწყე — უფასოა"', () => {
    render(<HomePage />);
    expect(screen.getByText('დაიწყე — უფასოა')).toBeDefined();
  });

  it('renders footballer feature list items', () => {
    render(<HomePage />);
    // "ფოტო გალერეა" also appears in features grid description — use getAllByText
    expect(screen.getAllByText(/ფოტო გალერეა/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/კლუბის გამოწერა/)).toBeDefined();
  });
});

describe('HomePage — club section', () => {
  it('renders club section heading', () => {
    render(<HomePage />);
    expect(screen.getByText('კლუბისთვის')).toBeDefined();
  });

  it('renders club CTA "კლუბი დარეგისტრირდი"', () => {
    render(<HomePage />);
    expect(screen.getByText('კლუბი დარეგისტრირდი')).toBeDefined();
  });

  it('renders club feature list items', () => {
    render(<HomePage />);
    expect(screen.getByText(/სტადიონი/)).toBeDefined();
    expect(screen.getByText(/ფეხბურთელების directory/)).toBeDefined();
  });
});

describe('HomePage — stats strip', () => {
  it('renders stat strip with platform stats', () => {
    render(<HomePage />);
    expect(screen.getByTestId('stat-strip')).toBeDefined();
  });

  it('renders stat values', () => {
    render(<HomePage />);
    expect(screen.getByText(/500\+/)).toBeDefined();
    expect(screen.getByText(/80\+/)).toBeDefined();
  });
});

describe('HomePage — section components', () => {
  it('renders HowItWorks section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('how-it-works')).toBeDefined();
  });

  it('renders Testimonials section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('testimonials')).toBeDefined();
  });

  it('renders FAQ section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('faq')).toBeDefined();
  });

  it('renders Contact section', () => {
    render(<HomePage />);
    expect(screen.getByTestId('contact')).toBeDefined();
  });
});
