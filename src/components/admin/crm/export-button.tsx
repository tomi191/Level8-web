"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  href: string;
  label?: string;
}

export function ExportButton({ href, label = "CSV" }: ExportButtonProps) {
  return (
    <a href={href} download>
      <Button
        variant="outline"
        size="sm"
        className="border-border text-muted-foreground hover:text-foreground"
      >
        <Download size={14} className="mr-1.5" />
        {label}
      </Button>
    </a>
  );
}
