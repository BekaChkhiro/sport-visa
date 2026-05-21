import { describe, expect, it } from 'vitest';

import { buttonVariants } from '@/components/ui/button';

describe('buttonVariants', () => {
  it('default variant contains bg-primary', () => {
    expect(buttonVariants()).toContain('bg-primary');
  });

  it('outline variant contains border', () => {
    expect(buttonVariants({ variant: 'outline' })).toContain('border');
  });

  it('destructive variant contains bg-destructive', () => {
    expect(buttonVariants({ variant: 'destructive' })).toContain('bg-destructive');
  });

  it('secondary variant contains bg-secondary', () => {
    expect(buttonVariants({ variant: 'secondary' })).toContain('bg-secondary');
  });

  it('ghost variant does not contain bg-primary', () => {
    const classes = buttonVariants({ variant: 'ghost' });
    expect(classes).not.toMatch(/\bbg-primary\b/);
  });

  it('link variant contains underline-offset', () => {
    expect(buttonVariants({ variant: 'link' })).toContain('underline-offset');
  });

  it('sm size contains h-9', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-9');
  });

  it('lg size contains h-11', () => {
    expect(buttonVariants({ size: 'lg' })).toContain('h-11');
  });

  it('icon size contains size-10', () => {
    expect(buttonVariants({ size: 'icon' })).toContain('size-10');
  });

  it('accepts and merges custom className', () => {
    expect(buttonVariants({ className: 'my-custom-class' })).toContain('my-custom-class');
  });
});
