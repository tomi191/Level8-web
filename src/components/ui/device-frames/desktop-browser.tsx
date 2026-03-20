import Image from "next/image";

interface DesktopBrowserProps {
  url: string;
  screenshot: string;
  alt: string;
  className?: string;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function DesktopBrowser({
  url,
  screenshot,
  alt,
  className = "",
}: DesktopBrowserProps) {
  return (
    <div
      className={`rounded-t-lg border border-border/50 overflow-hidden bg-black/30 ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-border/30">
        <div className="flex gap-1.5 group/dots">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 group-hover/dots:bg-red-500 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 group-hover/dots:bg-yellow-500 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40 group-hover/dots:bg-green-500 transition-colors" />
        </div>
        <span className="flex-1 text-center font-mono-terminal text-[10px] text-muted-foreground/50 truncate">
          {getDomain(url)}
        </span>
      </div>
      <div className="relative aspect-video">
        <Image
          src={screenshot}
          alt={alt}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="420px"
        />
      </div>
    </div>
  );
}
