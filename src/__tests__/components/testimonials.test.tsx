// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { Testimonials } from '@/components/testimonials';

describe('Testimonials', () => {
  it('renders section heading', () => {
    render(<Testimonials />);
    expect(screen.getByText('ისინი უკვე Sport Visa-ზეა')).toBeDefined();
  });

  it('renders all three testimonial cards as figure elements', () => {
    const { container } = render(<Testimonials />);
    const figures = container.querySelectorAll('figure');
    expect(figures).toHaveLength(3);
  });

  it('renders all testimonial author names', () => {
    render(<Testimonials />);
    expect(screen.getByText('გიორგი მამულაშვილი')).toBeDefined();
    expect(screen.getByText('ნინო ბერიძე')).toBeDefined();
    expect(screen.getByText('დავით ხარაბაძე')).toBeDefined();
  });

  it('renders all testimonial roles', () => {
    render(<Testimonials />);
    expect(screen.getByText(/მარჯვენა ფლანგი/)).toBeDefined();
    expect(screen.getByText(/სპორტ-დირექტორი/)).toBeDefined();
    expect(screen.getByText(/ცენტრალური ნახევარმცველი/)).toBeDefined();
  });

  it('renders all testimonial initials', () => {
    render(<Testimonials />);
    expect(screen.getByText('გმ')).toBeDefined();
    expect(screen.getByText('ნბ')).toBeDefined();
    expect(screen.getByText('დხ')).toBeDefined();
  });

  it('renders blockquote elements for quotes', () => {
    const { container } = render(<Testimonials />);
    const blockquotes = container.querySelectorAll('blockquote');
    expect(blockquotes).toHaveLength(3);
  });

  it('renders section subtitle', () => {
    render(<Testimonials />);
    expect(screen.getByText(/ფეხბურთელები და კლუბები/)).toBeDefined();
  });
});
