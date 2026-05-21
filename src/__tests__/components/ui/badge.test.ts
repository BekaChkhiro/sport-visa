import { describe, expect, it } from 'vitest';

import { badgeVariants } from '@/components/ui/badge';

describe('badgeVariants', () => {
  it('default variant contains bg-primary', () => {
    expect(badgeVariants()).toContain('bg-primary');
  });

  it('secondary variant contains bg-secondary', () => {
    expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary');
  });

  it('destructive variant contains bg-destructive', () => {
    expect(badgeVariants({ variant: 'destructive' })).toContain('bg-destructive');
  });

  it('outline variant contains border-border', () => {
    expect(badgeVariants({ variant: 'outline' })).toContain('border-border');
  });

  it('ghost variant does not contain bg-primary', () => {
    const classes = badgeVariants({ variant: 'ghost' });
    expect(classes).not.toMatch(/\bbg-primary\b/);
  });

  it('accepts and merges custom className', () => {
    expect(badgeVariants({ className: 'my-badge-class' })).toContain('my-badge-class');
  });

  it('always contains rounded-full', () => {
    expect(badgeVariants()).toContain('rounded-full');
    expect(badgeVariants({ variant: 'outline' })).toContain('rounded-full');
  });
});
