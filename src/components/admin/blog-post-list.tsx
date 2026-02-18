"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Eye, Trash2, Globe, FileEdit, Send, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBlogPost, publishBlogPost, unpublishBlogPost, sendToViber, sendToFacebook } from "@/lib/blog-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/admin";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  tofu: "TOFU",
  mofu: "MOFU",
  bofu: "BOFU",
  advertorial: "Advertorial",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogPostList({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8 md:p-12 max-w-md w-full">
          <div className="font-mono text-sm text-muted-foreground/50 space-y-1 mb-6">
            <p>$ ls blog_posts</p>
            <p className="text-neon/60">&gt; 0 results found</p>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Няма статии
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Създайте първата си AI-генерирана статия.
          </p>
          <Button asChild className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold">
            <Link href="/admin/blog/new">
              <Plus size={16} className="mr-2" />
              Нова статия
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // БЛОГ
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Статии ({posts.length})
          </h1>
        </div>
        <Button asChild className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold">
          <Link href="/admin/blog/new">
            <Plus size={16} className="mr-2" />
            Нова статия
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs text-muted-foreground/60">Статус</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground/60">Заглавие</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground/60 hidden md:table-cell">Категория</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground/60 hidden md:table-cell">Тип</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground/60 hidden lg:table-cell">Думи</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground/60">Дата</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.id}
                className={cn(
                  "border-border/30 cursor-pointer transition-colors",
                  post.published
                    ? "hover:bg-neon/5"
                    : "hover:bg-white/5"
                )}
                onClick={() => router.push(`/admin/blog/${post.id}`)}
              >
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
                      post.published
                        ? "bg-neon/10 text-neon border border-neon/20"
                        : "bg-white/5 text-muted-foreground border border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        post.published ? "bg-neon" : "bg-muted-foreground/50"
                      )}
                    />
                    {post.published ? "Live" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-foreground max-w-[300px] truncate">
                  {post.title}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {post.category || "\u2014"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {post.content_type && (
                    <span className="text-xs font-mono text-neon/60 bg-neon/5 px-1.5 py-0.5 rounded">
                      {CONTENT_TYPE_LABELS[post.content_type] || post.content_type}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm font-mono">
                  {post.word_count || 0}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {post.created_at ? formatDate(post.created_at) : "\u2014"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-surface border-border">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/blog/${post.id}`);
                        }}
                      >
                        <FileEdit size={14} className="mr-2" />
                        Редактирай
                      </DropdownMenuItem>
                      {post.published ? (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/blog/${post.slug}`, "_blank");
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            Виж на сайта
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await sendToViber(post.id);
                                toast.success("Статията е изпратена във Viber!");
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Грешка при изпращане");
                              }
                            }}
                          >
                            <Send size={14} className="mr-2" />
                            Изпрати във Viber
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await sendToFacebook(post.id);
                                toast.success("Статията е публикувана във Facebook!");
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Грешка при публикуване");
                              }
                            }}
                          >
                            <Facebook size={14} className="mr-2" />
                            Публикувай във Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation();
                              await unpublishBlogPost(post.id);
                              toast.success("Статията е скрита");
                            }}
                          >
                            <Globe size={14} className="mr-2" />
                            Скрий (Draft)
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            await publishBlogPost(post.id);
                            toast.success("Статията е публикувана");
                          }}
                        >
                          <Globe size={14} className="mr-2" />
                          Публикувай
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm("Сигурни ли сте?")) {
                            await deleteBlogPost(post.id);
                            toast.success("Статията е изтрита");
                          }
                        }}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Изтрий
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
