// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { FAQ } from '@/components/faq';

describe('FAQ', () => {
  it('renders section heading', () => {
    render(<FAQ />);
    expect(screen.getByText('ხშირად დასმული კითხვები')).toBeDefined();
  });

  it('renders section subtitle', () => {
    render(<FAQ />);
    expect(screen.getByText(/პასუხი ყველაზე გავრცელებულ/)).toBeDefined();
  });

  it('renders all six question triggers', () => {
    render(<FAQ />);
    expect(screen.getByText('რეგისტრაცია ფასიანია?')).toBeDefined();
    expect(screen.getByText('როგორ ხდება კლუბთან კავშირი?')).toBeDefined();
    expect(screen.getByText('მჭირდება ვიზა ან სამართლებრივი დოკუმენტაცია?')).toBeDefined();
    expect(screen.getByText('რა ასაკის ფეხბურთელები შეიძლება დარეგისტრირდნენ?')).toBeDefined();
    expect(screen.getByText('შემიძლია ერთზე მეტ კლუბს გავუგზავნო მოთხოვნა?')).toBeDefined();
    expect(screen.getByText('რა ხდება, თუ კლუბი ვერ ვიპოვე?')).toBeDefined();
  });

  it('renders the accordion root with data-slot', () => {
    const { container } = render(<FAQ />);
    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull();
  });

  it('renders six accordion items', () => {
    const { container } = render(<FAQ />);
    const items = container.querySelectorAll('[data-slot="accordion-item"]');
    expect(items).toHaveLength(6);
  });

  it('renders accordion triggers', () => {
    const { container } = render(<FAQ />);
    const triggers = container.querySelectorAll('[data-slot="accordion-trigger"]');
    expect(triggers).toHaveLength(6);
  });
});
