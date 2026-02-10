interface AdminEmptyStateProps {
  command: string;
}

export function AdminEmptyState({ command }: AdminEmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground/50">
        $ {command}
      </p>
      <p className="font-mono text-sm text-muted-foreground/50 mt-1">
        0 results found
      </p>
    </div>
  );
}
