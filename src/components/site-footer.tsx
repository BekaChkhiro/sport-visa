export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="text-muted-foreground container mx-auto flex h-14 items-center justify-between px-4 text-sm">
        <span>© {new Date().getFullYear()} Sport Visa</span>
        <span>ფეხბურთელებისა და კლუბების პლატფორმა</span>
      </div>
    </footer>
  );
}
