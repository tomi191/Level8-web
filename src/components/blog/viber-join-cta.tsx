"use client";

import Image from "next/image";

const VIBER_INVITE_LINK = "https://invite.viber.com/?g2=AQBX9VCo1of%2BrlYRb8wP4YHx9dHsrFsOnvCduX6%2B%2FZeIMBoWesTBOoPRX9kQpRI3";

function ViberIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/viber.svg"
      alt=""
      width={24}
      height={24}
      className={className}
      aria-hidden
    />
  );
}

export function ViberJoinCTA() {
  return (
    <div className="mt-10 rounded-2xl border-2 border-neon/20 bg-gradient-to-br from-neon/5 to-transparent p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#7360f2] flex items-center justify-center">
          <ViberIcon className="w-6 h-6 invert" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            Присъедини се към нашия Viber канал
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Получавай първи всички нови статии, съвети и ексклузивни материали директно във Viber.
          </p>
          <a
            href={VIBER_INVITE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7360f2] hover:bg-[#665ac8] text-white font-medium text-sm transition-colors"
          >
            <ViberIcon className="w-4 h-4 invert" />
            Присъедини се сега
          </a>
        </div>
      </div>
    </div>
  );
}
