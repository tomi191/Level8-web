"use client";

import { FOOTER, NAV_ITEMS } from "@/lib/constants";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { resetConsent } from "@/lib/consent";

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
            <p className="mt-1 text-xs text-muted-foreground/60">
              {FOOTER.eik}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href={FOOTER.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-neon transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={FOOTER.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-neon transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={FOOTER.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-neon transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
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
              <li><a href={FOOTER.viber} className="hover:text-neon transition-colors inline-flex items-center gap-1.5"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.534 6.827.39 10.147c-.144 3.32-.192 9.553 5.856 11.257l.048.016v2.58s-.036.96.6 1.152c.768.24 1.22-.492 1.956-1.284l1.392-1.58c3.828.324 6.78-.408 7.116-.516.78-.252 5.184-.816 5.904-6.66.744-6.024-.36-9.828-2.34-11.544l-.004-.004c-.564-.516-2.892-2.252-8.028-2.332 0 0-.3-.012-.684-.012l.196-.22zm.468 1.932h.084c4.476.084 6.48 1.5 6.96 1.932 1.668 1.44 2.58 4.86 1.944 9.924-.6 4.86-4.164 5.244-4.836 5.46-.276.096-2.868.72-6.168.528 0 0-2.444 2.94-3.204 3.708-.12.12-.264.168-.36.144-.132-.036-.168-.192-.168-.42l.024-4.02c-5.052-1.4-4.752-6.636-4.632-9.396.12-2.76.756-5.016 2.196-6.432 1.968-1.8 5.58-2.068 7.44-2.088h.72v.66zm.012 2.628c-.18 0-.18.276 0 .288 1.14.048 2.16.468 2.988 1.188.828.72 1.308 1.656 1.44 2.796.024.18.3.168.288-.012-.156-1.272-.696-2.328-1.62-3.132-.924-.804-2.04-1.224-3.312-1.272h.216v.144zm-3.24 1.332c-.324-.012-.672.096-.924.36l-.36.372c-.228.252-.276.6-.156.912.564 1.488 1.404 2.82 2.544 4.02 1.344 1.5 2.916 2.628 4.716 3.42.3.132.66.072.888-.144l.324-.336c.528-.54.24-1.128-.12-1.368l-1.476-.972c-.36-.24-.852-.204-1.14.072l-.444.408c-.168.156-.42.18-.612.06a10.788 10.788 0 01-2.46-2.064 10.149 10.149 0 01-1.56-2.58c-.084-.204-.036-.444.132-.6l.42-.456c.228-.252.3-.636.084-.912L8.7 6.36c-.252-.336-.576-.492-.9-.504l-.156.036zm6.372.408c-.168 0-.168.264 0 .276.768.048 1.38.336 1.872.864.48.528.756 1.152.78 1.884.012.18.288.18.276 0-.024-.852-.336-1.56-.888-2.148-.564-.588-1.26-.9-2.076-.948h.036v.072zm-.144 1.284c-.168-.012-.192.252-.024.276.888.168 1.332.72 1.38 1.632.012.18.288.168.276 0-.036-.552-.216-.996-.588-1.356-.36-.36-.78-.54-1.272-.552h.228z" /></svg>Viber</a></li>
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
            <button
              type="button"
              onClick={() => resetConsent()}
              className="hover:text-neon transition-colors cursor-pointer"
            >
              Бисквитки
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
