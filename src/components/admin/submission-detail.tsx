"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Archive,
  Trash2,
  Loader2,
  Globe,
  Clock,
  Zap,
  User,
  Bot,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  markSubmissionRead,
  archiveSubmission,
  deleteSubmission,
  updateSubmissionNotes,
  getSessionForSubmission,
} from "@/lib/admin-actions";
import type { Submission, VisitorSession, ChatMessage as ChatHistoryMsg } from "@/types/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubmissionDetailProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_LABELS: Record<string, string> = {
  contact: "Контакт",
  lead: "Одит",
  chat: "Чатбот",
};

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}с`;
  return `${m}м ${s}с`;
}

function formatRelative(from: string, to: string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}с`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}м`;
  return `${Math.floor(min / 60)}ч`;
}

export function SubmissionDetail({
  submission,
  open,
  onOpenChange,
}: SubmissionDetailProps) {
  const [notes, setNotes] = useState(submission?.notes || "");
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch visitor session when submission opens
  useEffect(() => {
    setNotes(submission?.notes || "");
    setSession(null);
    if (!submission?.session_id) return;
    getSessionForSubmission(submission.session_id)
      .then((s) => setSession(s))
      .catch(() => setSession(null));
  }, [submission?.id, submission?.session_id, submission?.notes]);

  if (!submission) return null;

  const chatHistory = (submission.chat_history || []) as ChatHistoryMsg[];
  const hasAttribution =
    submission.source_page ||
    submission.utm_source ||
    submission.utm_medium ||
    submission.utm_campaign ||
    submission.referrer;

  function handleMarkRead() {
    startTransition(async () => {
      await markSubmissionRead(submission!.id, !submission!.is_read);
      toast.success(submission!.is_read ? "Маркирано като непрочетено" : "Маркирано като прочетено");
    });
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveSubmission(submission!.id);
      toast.success("Архивирано");
      onOpenChange(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSubmission(submission!.id);
      toast.success("Изтрито");
      onOpenChange(false);
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateSubmissionNotes(submission!.id, notes);
      toast.success("Бележките са запазени");
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface border-border w-full sm:w-[520px] overflow-y-auto">
        <SheetTitle className="sr-only">Детайли за заявка</SheetTitle>
        <SheetDescription className="sr-only">
          Преглед на заявка от {submission.name || submission.email}
        </SheetDescription>

        <div className="space-y-6 mt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs font-mono border-neon/20 text-neon/60"
            >
              {TYPE_LABELS[submission.type] || submission.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(submission.created_at).toLocaleString("bg-BG")}
            </span>
          </div>

          {/* Contact Fields */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-background/50">
            {submission.name && (
              <FieldRow label="name" value={submission.name} />
            )}
            {submission.email && (
              <FieldRow label="email" value={submission.email} link={`mailto:${submission.email}`} />
            )}
            {submission.phone && (
              <FieldRow label="phone" value={submission.phone} link={`tel:${submission.phone}`} />
            )}
            {submission.website && (
              <FieldRow label="website" value={submission.website} link={submission.website} />
            )}
          </div>

          {/* Contact Message (for contact type) */}
          {submission.type === "contact" && submission.message && (
            <div>
              <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
                // СЪОБЩЕНИЕ
              </span>
              <p className="text-sm text-foreground whitespace-pre-wrap p-3 rounded-lg border border-border bg-background/30">
                {submission.message}
              </p>
            </div>
          )}

          {/* Chat History (for chat type) */}
          {submission.type === "chat" && chatHistory.length > 0 && (
            <div>
              <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
                // РАЗГОВОР ({chatHistory.length} съобщения)
              </span>
              <div className="space-y-2 rounded-lg border border-border bg-background/30 p-3 max-h-[320px] overflow-y-auto">
                {chatHistory.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 text-sm",
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 rounded-full p-1",
                        m.role === "user"
                          ? "bg-neon/10 text-neon"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs",
                        m.role === "user"
                          ? "bg-neon/10 text-foreground"
                          : "bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attribution */}
          {hasAttribution && (
            <div>
              <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
                // КОНТЕКСТ
              </span>
              <div className="space-y-1.5 p-3 rounded-lg border border-border bg-background/30 text-xs font-mono">
                {submission.source_page && (
                  <Row label="Страница" value={submission.source_page} />
                )}
                {submission.utm_source && (
                  <Row label="UTM Source" value={submission.utm_source} highlight />
                )}
                {submission.utm_medium && (
                  <Row label="UTM Medium" value={submission.utm_medium} />
                )}
                {submission.utm_campaign && (
                  <Row label="UTM Campaign" value={submission.utm_campaign} />
                )}
                {submission.referrer && (
                  <Row label="Referrer" value={submission.referrer} />
                )}
              </div>
            </div>
          )}

          {/* Session Timeline */}
          {session && (
            <div>
              <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
                // ПОВЕДЕНИЕ НА САЙТА
              </span>
              <div className="p-3 rounded-lg border border-border bg-background/30 space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <StatBox
                    icon={Globe}
                    label="Страници"
                    value={String(session.page_view_count)}
                  />
                  <StatBox
                    icon={Clock}
                    label="Първо посещение"
                    value={new Date(session.first_visit_at).toLocaleDateString("bg-BG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    small
                  />
                  <StatBox
                    icon={Zap}
                    label="До submit"
                    value={formatRelative(session.first_visit_at, submission.created_at)}
                  />
                </div>

                {/* Page views timeline */}
                {session.page_views && session.page_views.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-border/30">
                    <span className="text-[10px] font-mono text-muted-foreground/40">TIMELINE</span>
                    <div className="space-y-1 max-h-[240px] overflow-y-auto">
                      {session.page_views.map((pv, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs font-mono p-1.5 rounded hover:bg-white/[0.02]"
                        >
                          <span className="text-neon/40 w-5 text-right">{i + 1}</span>
                          <ArrowRight size={10} className="text-muted-foreground/30 shrink-0" />
                          <span className="flex-1 truncate text-foreground">{pv.path}</span>
                          <span className="text-[10px] text-muted-foreground/40 shrink-0">
                            {new Date(pv.timestamp).toLocaleTimeString("bg-BG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
              // БЕЛЕЖКИ
            </span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Добави бележка..."
              className="bg-background border-border focus:border-neon/50 min-h-[80px] text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveNotes}
              disabled={isPending || notes === (submission.notes || "")}
              className="mt-2 text-xs text-neon hover:text-neon hover:bg-neon/10"
            >
              Запази бележка
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handleMarkRead}
              disabled={isPending}
              className="justify-start text-sm"
            >
              {isPending ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : submission.is_read ? (
                <EyeOff size={14} className="mr-2" />
              ) : (
                <Eye size={14} className="mr-2" />
              )}
              {submission.is_read ? "Маркирай непрочетено" : "Маркирай прочетено"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleArchive}
              disabled={isPending}
              className="justify-start text-sm"
            >
              <Archive size={14} className="mr-2" />
              Архивирай
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={isPending}
              className="justify-start text-sm text-red-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={14} className="mr-2" />
              Изтрий
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FieldRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider shrink-0 mt-0.5">
        $ {label}
      </span>
      {link ? (
        <a
          href={link}
          target={link.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="text-sm text-neon hover:underline break-all text-right inline-flex items-center gap-1"
        >
          {value}
          {link.startsWith("http") && <ExternalLink size={10} className="shrink-0" />}
        </a>
      ) : (
        <span className="text-sm text-foreground break-all text-right">{value}</span>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground/40 shrink-0">{label}</span>
      <span
        className={cn(
          "break-all text-right",
          highlight ? "text-neon" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  small = false,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="p-2 rounded border border-border/50 bg-background/50">
      <Icon size={12} className="mx-auto text-neon/40 mb-1" />
      <div className={cn("font-mono font-bold text-foreground", small ? "text-[10px]" : "text-sm")}>
        {value}
      </div>
      <div className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{label}</div>
    </div>
  );
}
