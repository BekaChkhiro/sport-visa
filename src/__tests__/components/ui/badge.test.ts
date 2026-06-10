import { describe, expect, it } from 'vitest';

import { badgeVariants } from '@/components/ui/badge';

describe('badgeVariants', () => {
  it('default variant uses brand tone classes', () => {
    const classes = badgeVariants();
    // new default: bg-brand-400/10 text-brand-300 border-brand-400/25
    expect(classes).toContain('bg-brand-400/10');
    expect(classes).toContain('text-brand-300');
  });

  it('secondary variant uses ink tone classes', () => {
    const classes = badgeVariants({ variant: 'secondary' });
    expect(classes).toContain('bg-ink-800');
    expect(classes).toContain('text-ink-200');
  });

  it('destructive variant uses danger tone classes', () => {
    const classes = badgeVariants({ variant: 'destructive' });
    expect(classes).toContain('bg-danger-400/10');
    expect(classes).toContain('text-danger-300');
  });

  it('outline variant uses ink border classes', () => {
    const classes = badgeVariants({ variant: 'outline' });
    expect(classes).toContain('border-ink-700');
  });

  it('ghost variant does not contain bg-primary', () => {
    const classes = badgeVariants({ variant: 'ghost' });
    expect(classes).not.toMatch(/\bbg-primary\b/);
  });

  it('accepts and merges custom className', () => {
    expect(badgeVariants({ className: 'my-badge-class' })).toContain('my-badge-class');
  });

  it('always contains rounded-pill', () => {
    expect(badgeVariants()).toContain('rounded-pill');
    expect(badgeVariants({ variant: 'outline' })).toContain('rounded-pill');
  });

  it('success variant uses success tone classes', () => {
    const classes = badgeVariants({ variant: 'success' });
    expect(classes).toContain('bg-success-400/10');
    expect(classes).toContain('text-success-300');
  });

  it('warning variant uses warning tone classes', () => {
    const classes = badgeVariants({ variant: 'warning' });
    expect(classes).toContain('bg-warning-400/10');
    expect(classes).toContain('text-warning-300');
  });

  it('info variant uses info tone classes', () => {
    const classes = badgeVariants({ variant: 'info' });
    expect(classes).toContain('bg-info-400/10');
    expect(classes).toContain('text-info-300');
  });
});
