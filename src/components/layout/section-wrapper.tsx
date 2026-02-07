import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ id, children, className }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("relative py-20 md:py-28 px-4 sm:px-6 lg:px-8", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
