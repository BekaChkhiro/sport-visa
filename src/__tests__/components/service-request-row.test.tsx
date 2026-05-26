// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

import { ServiceRequestRow } from '@/components/service-request-row';

const DATE = new Date('2026-05-18T10:00:00Z');

describe('ServiceRequestRow — labels', () => {
  it('renders meal_plan label', () => {
    render(<ServiceRequestRow id="r1" type="meal_plan" status="pending" requestedAt={DATE} />);
    expect(screen.getByText('კვების გეგმა')).toBeDefined();
  });

  it('renders personal_trainer label', () => {
    render(
      <ServiceRequestRow id="r1" type="personal_trainer" status="pending" requestedAt={DATE} />,
    );
    expect(screen.getByText('პერსონალური მწვრთნელი')).toBeDefined();
  });

  it('renders team_doctor label', () => {
    render(<ServiceRequestRow id="r1" type="team_doctor" status="pending" requestedAt={DATE} />);
    expect(screen.getByText('გუნდის ექიმი')).toBeDefined();
  });

  it('renders other label', () => {
    render(<ServiceRequestRow id="r1" type="other" status="pending" requestedAt={DATE} />);
    expect(screen.getByText('სხვა სერვისი')).toBeDefined();
  });
});

describe('ServiceRequestRow — status and date', () => {
  it('renders status pill', () => {
    const { container } = render(
      <ServiceRequestRow id="r1" type="meal_plan" status="pending" requestedAt={DATE} />,
    );
    expect(container.querySelector('[data-slot="status-pill"]')).not.toBeNull();
  });

  it('renders time element with ISO dateTime', () => {
    const { container } = render(
      <ServiceRequestRow id="r1" type="meal_plan" status="pending" requestedAt={DATE} />,
    );
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    expect(time!.getAttribute('dateTime')).toBe(DATE.toISOString());
  });

  it('sets data-request-id attribute', () => {
    const { container } = render(
      <ServiceRequestRow id="req-42" type="meal_plan" status="approved" requestedAt={DATE} />,
    );
    const row = container.querySelector('[data-slot="service-request-row"]');
    expect(row?.getAttribute('data-request-id')).toBe('req-42');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ServiceRequestRow
        id="r1"
        type="other"
        status="rejected"
        requestedAt={DATE}
        className="my-custom"
      />,
    );
    const row = container.querySelector('[data-slot="service-request-row"]');
    expect((row as HTMLElement).className).toContain('my-custom');
  });
});
