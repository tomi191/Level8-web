"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Archive, Trash2, Loader2 } from "lucide-react";
import {
  markSubmissionRead,
  archiveSubmission,
  deleteSubmission,
  updateSubmissionNotes,
} from "@/lib/admin-actions";
import type { Submission } from "@/types/admin";
import { toast } from "sonner";

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

const FIELD_CONFIG: {
  key: keyof Submission;
  label: string;
  types: string[];
}[] = [
  { key: "name", label: "name", types: ["contact", "chat"] },
  { key: "email", label: "email", types: ["lead"] },
  { key: "phone", label: "phone", types: ["contact", "chat"] },
  { key: "website", label: "website", types: ["contact"] },
  { key: "message", label: "message", types: ["contact"] },
];

export function SubmissionDetail({
  submission,
  open,
  onOpenChange,
}: SubmissionDetailProps) {
  const [notes, setNotes] = useState(submission?.notes || "");
  const [isPending, startTransition] = useTransition();

  if (!submission) return null;

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
      <SheetContent className="bg-surface border-border w-full sm:w-[440px] overflow-y-auto">
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

          {/* Fields */}
          <div className="space-y-4">
            {FIELD_CONFIG.filter((f) => f.types.includes(submission.type)).map(
              (field) => {
                const value = submission[field.key];
                if (!value) return null;
                return (
                  <div key={field.key}>
                    <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-1">
                      $ {field.label}
                    </span>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {String(value)}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          {/* Notes */}
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-wider block mb-2">
              $ notes
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
