import { Logo } from '@/components/logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="text-muted-foreground container mx-auto flex h-14 items-center justify-between px-4 text-sm">
        <Logo size="sm" showWordmark={false} className="opacity-70" />
        <span>© {new Date().getFullYear()} Sport Visa</span>
        <span className="hidden sm:inline">ფეხბურთელებისა და კლუბების პლატფორმა</span>
      </div>
    </footer>
  );
}
