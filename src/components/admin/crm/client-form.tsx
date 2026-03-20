"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, Search, Building2 } from "lucide-react";
import { createCrmClient, updateCrmClient } from "@/lib/crm-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CrmClient, CrmClientContact } from "@/types/crm";
import { ContactsEditor } from "@/components/admin/crm/contacts-editor";
import Link from "next/link";

interface ClientFormProps {
  mode: "create" | "edit";
  client?: CrmClient;
}

export function ClientForm({ mode, client }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autoFill, setAutoFill] = useState<{
    company_name?: string;
    address?: string;
    city?: string;
    contact_person?: string;
  } | null>(null);

  async function handleEikLookup() {
    const eikInput = document.getElementById("eik") as HTMLInputElement;
    const eik = eikInput?.value?.trim();
    if (!eik || eik.length < 9) {
      toast.error("Въведете валиден ЕИК (минимум 9 цифри)");
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await fetch(`/api/crm/eik-lookup?eik=${eik}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "ЕИК не е намерен");
        return;
      }

      // Auto-fill the form fields
      const fields: Record<string, string> = {
        company_name: data.companyName ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        contact_person: data.manager ?? "",
      };

      for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el && value) {
          el.value = value;
        }
      }

      setAutoFill(fields);
      toast.success(
        `Данни от ТР: ${data.companyName}`,
        { description: data.activity ? data.activity.slice(0, 100) + "..." : undefined }
      );
    } catch {
      toast.error("Грешка при връзка с Търговския регистър");
    } finally {
      setIsLookingUp(false);
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "edit" && client) {
          await updateCrmClient(client.id, formData);
          toast.success("Клиентът е обновен");
          router.push(`/admin/crm/clients/${client.id}`);
        } else {
          const result = await createCrmClient(formData);
          toast.success("Клиентът е създаден");
          router.push(`/admin/crm/clients/${result.id}`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={
          mode === "edit" && client
            ? `/admin/crm/clients/${client.id}`
            : "/admin/crm/clients"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        {mode === "edit" ? "Към клиента" : "Към списъка"}
      </Link>

      <form action={handleSubmit} className="space-y-6">
        {/* Main info section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ОСНОВНИ ДАННИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Информация за фирмата
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company name */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="company_name"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ company_name *
              </Label>
              <Input
                id="company_name"
                name="company_name"
                required
                defaultValue={client?.company_name ?? ""}
                placeholder="Име на фирмата"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* EIK + Lookup */}
            <div className="space-y-2">
              <Label
                htmlFor="eik"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ eik
              </Label>
              <div className="flex gap-2">
                <Input
                  id="eik"
                  name="eik"
                  defaultValue={client?.eik ?? ""}
                  placeholder="ЕИК (9-13 цифри)"
                  className="bg-background border-border focus:border-neon/50 font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEikLookup}
                  disabled={isLookingUp}
                  className="shrink-0 border-neon/30 text-neon hover:bg-neon/10 h-9 px-3"
                  title="Провери в Търговски регистър"
                >
                  {isLookingUp ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  <span className="ml-1.5 text-xs hidden sm:inline">ТР</span>
                </Button>
              </div>
              {autoFill && (
                <p className="text-[10px] text-neon/60 font-mono">
                  Данните са попълнени от Търговския регистър
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={client?.status ?? "active"}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="paused">На пауза</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            {/* Contact person */}
            <div className="space-y-2">
              <Label
                htmlFor="contact_person"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ contact_person
              </Label>
              <Input
                id="contact_person"
                name="contact_person"
                defaultValue={client?.contact_person ?? ""}
                placeholder="Име на контактното лице"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={client?.phone ?? ""}
                placeholder="+359 ..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ""}
                placeholder="email@example.com"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Billing email */}
            <div className="space-y-2">
              <Label
                htmlFor="billing_email"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ billing_email
              </Label>
              <Input
                id="billing_email"
                name="billing_email"
                type="email"
                defaultValue={client?.billing_email ?? ""}
                placeholder="Email за фактури"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* Address & Contract section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // АДРЕС И ДОГОВОР
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Допълнителни данни
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ address
              </Label>
              <Input
                id="address"
                name="address"
                defaultValue={client?.address ?? ""}
                placeholder="Адрес"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ city
              </Label>
              <Input
                id="city"
                name="city"
                defaultValue={client?.city ?? ""}
                placeholder="Град"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label
                htmlFor="payment_method"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ payment_method
              </Label>
              <select
                id="payment_method"
                name="payment_method"
                defaultValue={client?.payment_method ?? ""}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                <option value="">-- Избери --</option>
                <option value="bank_transfer">Банков превод</option>
                <option value="card">Карта</option>
                <option value="cash">В брой</option>
              </select>
            </div>

            {/* Contract start date */}
            <div className="space-y-2">
              <Label
                htmlFor="contract_start_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ contract_start_date
              </Label>
              <Input
                id="contract_start_date"
                name="contract_start_date"
                type="date"
                defaultValue={client?.contract_start_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="tags"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ tags
              </Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={client?.tags?.join(", ") ?? ""}
                placeholder="wordpress, seo, поддръжка (разделени със запетая)"
                className="bg-background border-border focus:border-neon/50"
              />
              <p className="text-[10px] text-muted-foreground/40 font-mono">
                Разделете таговете със запетая
              </p>
            </div>

            {/* Is Internal */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_internal"
                  value="true"
                  defaultChecked={client?.is_internal ?? false}
                  className="h-4 w-4 rounded border-border bg-background text-neon focus:ring-neon/50 accent-[oklch(0.87_0.29_128.22)]"
                />
                <div className="flex items-center gap-2">
                  <Building2
                    size={14}
                    className="text-muted-foreground/60 group-hover:text-neon/60 transition-colors"
                  />
                  <span className="text-sm text-foreground">
                    Вътрешен проект на ЛЕВЕЛ 8
                  </span>
                </div>
              </label>
              <p className="text-[10px] text-muted-foreground/40 font-mono ml-7">
                Маркирай ако това е собствен проект, а не клиентски
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="notes"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={client?.notes ?? ""}
                placeholder="Вътрешни бележки за клиента..."
                rows={4}
                className="bg-background border-border focus:border-neon/50 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Contacts section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // КОНТАКТИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Контактни лица
            </h2>
            <p className="text-[10px] text-muted-foreground/40 font-mono mt-1">
              Добавете допълнителни контактни лица за този клиент
            </p>
          </div>
          <div className="p-5">
            <ContactsEditor
              initialContacts={(client as CrmClient & { contacts?: CrmClientContact[] })?.contacts ?? []}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={
              mode === "edit" && client
                ? `/admin/crm/clients/${client.id}`
                : "/admin/crm/clients"
            }
          >
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
            >
              Отказ
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "bg-neon text-background hover:bg-neon/90 font-medium",
              "disabled:opacity-50"
            )}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {mode === "edit" ? "Записване..." : "Създаване..."}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {mode === "edit" ? "Запази промените" : "Създай клиент"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
