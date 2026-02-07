import { FOOTER, NAV_ITEMS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              LEVEL<span className="text-neon">8</span>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              {FOOTER.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Навигация
            </h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-neon transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={FOOTER.privacyUrl}
                  className="text-sm text-muted-foreground hover:text-neon transition-colors"
                >
                  {FOOTER.privacyLabel}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Контакти
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{FOOTER.email}</li>
              <li>{FOOTER.phone}</li>
              <li>{FOOTER.address}</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>{FOOTER.copyright}</p>
          <a
            href={FOOTER.privacyUrl}
            className="hover:text-neon transition-colors"
          >
            {FOOTER.privacyLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
