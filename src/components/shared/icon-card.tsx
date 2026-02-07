import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface IconCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function IconCard({ icon, title, description, className }: IconCardProps) {
  return (
    <Card
      className={cn(
        "bg-surface border-border hover:border-neon/30 transition-all duration-300 group",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-neon transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
