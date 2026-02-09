import { FOOTER, NAV_ITEMS } from "@/lib/constants";
import { CircuitDivider } from "@/components/animations/circuit-divider";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              LEVEL<span className="text-neon text-glow-neon">8</span>
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
              <li><a href={`mailto:${FOOTER.email}`} className="hover:text-neon transition-colors">{FOOTER.email}</a></li>
              <li><a href={`tel:${FOOTER.phone.replace(/\s/g, "")}`} className="hover:text-neon transition-colors">{FOOTER.phone}</a></li>
              <li>{FOOTER.address}</li>
            </ul>
          </div>
        </div>

        <div className="my-8">
          <CircuitDivider />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>{FOOTER.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="font-mono-terminal text-[10px] text-muted-foreground/40 tracking-wider">v8.0.1</span>
            <a
              href={FOOTER.privacyUrl}
              className="hover:text-neon transition-colors"
            >
              {FOOTER.privacyLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
