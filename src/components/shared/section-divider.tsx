interface SectionDividerProps {
  number: string;
  title: string;
  id?: string;
}

export function SectionDivider({ number, title, id }: SectionDividerProps) {
  return (
    <div id={id} className="font-mono-terminal text-xs md:text-sm text-neon/60 tracking-wider flex items-center gap-3 scroll-mt-24">
      <span className="shrink-0">──── {number}</span>
      <span className="text-neon">// {title.toUpperCase()}</span>
      <span
        aria-hidden="true"
        className="flex-1 h-px bg-gradient-to-r from-neon/30 via-neon/10 to-transparent"
      />
    </div>
  );
}
