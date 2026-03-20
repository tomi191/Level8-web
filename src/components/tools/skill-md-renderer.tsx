"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface SkillMdRendererProps {
  content: string;
  frontmatter?: Record<string, string>;
}

export function SkillMdRenderer({ content, frontmatter }: SkillMdRendererProps) {
  return (
    <div className="space-y-6">
      {/* Frontmatter table */}
      {frontmatter && Object.keys(frontmatter).length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-border/50 bg-neon/5">
            <span className="text-[10px] font-mono text-neon/50 tracking-wider uppercase">
              SKILL.md Frontmatter
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {Object.entries(frontmatter).map(([key, value]) => (
              <div key={key} className="flex px-4 py-2.5">
                <span className="text-xs font-mono text-neon/60 w-40 shrink-0">
                  {key}
                </span>
                <span className="text-xs text-muted-foreground">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markdown body */}
      <div className="skill-md-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-foreground mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-foreground mt-6 mb-3 border-b border-border/30 pb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-foreground mt-5 mb-2">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-foreground mt-4 mb-2">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-5 space-y-1 mb-4 text-sm text-muted-foreground">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-5 space-y-1 mb-4 text-sm text-muted-foreground">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-neon/10 text-neon/70 text-[13px] font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className={cn(
                    "block rounded-xl border border-border bg-black/40 p-4 text-sm font-mono text-neon/60 overflow-x-auto mb-4",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="rounded-xl border border-border bg-black/40 p-4 text-sm font-mono text-neon/60 overflow-x-auto mb-4">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-neon/30 pl-4 my-4 text-sm text-muted-foreground/80 italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon/80 hover:text-neon underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-neon/5 border-b border-border">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-mono text-neon/60">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-muted-foreground border-t border-border/30">
                {children}
              </td>
            ),
            hr: () => <hr className="border-border/30 my-6" />,
            strong: ({ children }) => (
              <strong className="text-foreground font-semibold">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
