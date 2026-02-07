import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CtaButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "neon" | "outline" | "gold";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function CtaButton({
  children,
  href,
  onClick,
  variant = "neon",
  className,
  type = "button",
  disabled,
}: CtaButtonProps) {
  const styles = {
    neon: "bg-neon text-primary-foreground hover:bg-neon/90 animate-glow-pulse font-semibold",
    outline:
      "border border-neon/50 text-neon hover:bg-neon/10 font-semibold bg-transparent",
    gold: "bg-gold text-primary-foreground hover:bg-gold/90 glow-gold font-semibold",
  };

  if (href) {
    return (
      <Button asChild className={cn(styles[variant], "px-6 py-3 text-base", className)}>
        <a href={href}>{children}</a>
      </Button>
    );
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles[variant], "px-6 py-3 text-base", className)}
    >
      {children}
    </Button>
  );
}
