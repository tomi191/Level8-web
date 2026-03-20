"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { createCrmWebsite, updateCrmWebsite } from "@/lib/crm-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CrmWebsite, CrmClient } from "@/types/crm";
import Link from "next/link";

interface WebsiteFormProps {
  mode: "create" | "edit";
  website?: CrmWebsite;
  clients: Pick<CrmClient, "id" | "company_name">[];
  defaultClientId?: string;
}

export function WebsiteForm({
  mode,
  website,
  clients,
  defaultClientId,
}: WebsiteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "edit" && website) {
          await updateCrmWebsite(website.id, formData);
          toast.success("Сайтът е обновен");
          router.push(`/admin/crm/websites/${website.id}`);
        } else {
          const result = await createCrmWebsite(formData);
          toast.success("Сайтът е създаден");
          router.push(`/admin/crm/websites/${result.id}`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  const selectClass = cn(
    "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
    "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
    "text-foreground"
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={
          mode === "edit" && website
            ? `/admin/crm/websites/${website.id}`
            : "/admin/crm/websites"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        {mode === "edit" ? "Към сайта" : "Към списъка"}
      </Link>

      <form action={handleSubmit} className="space-y-6">
        {/* === Section: Основни === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ОСНОВНИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Основни данни
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="client_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ client_id *
              </Label>
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue={website?.client_id ?? defaultClientId ?? ""}
                className={selectClass}
              >
                <option value="">-- Избери клиент --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label
                htmlFor="domain"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ domain *
              </Label>
              <Input
                id="domain"
                name="domain"
                required
                defaultValue={website?.domain ?? ""}
                placeholder="example.bg"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label
                htmlFor="url"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ url
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={website?.url ?? ""}
                placeholder="https://example.bg"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={website?.name ?? ""}
                placeholder="Име на проекта"
                className="bg-background border-border focus:border-neon/50"
              />
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
                defaultValue={website?.status ?? "active"}
                className={selectClass}
              >
                <option value="active">Активен</option>
                <option value="development">В разработка</option>
                <option value="maintenance">Поддръжка</option>
                <option value="archived">Архивиран</option>
              </select>
            </div>
          </div>
        </div>

        {/* === Section: Платформа === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ПЛАТФОРМА
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Платформа и хостинг
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform */}
            <div className="space-y-2">
              <Label
                htmlFor="platform"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ platform
              </Label>
              <select
                id="platform"
                name="platform"
                defaultValue={website?.platform ?? ""}
                className={selectClass}
              >
                <option value="">-- Избери --</option>
                <option value="wordpress">WordPress</option>
                <option value="nextjs">Next.js</option>
                <option value="shopify">Shopify</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Platform version */}
            <div className="space-y-2">
              <Label
                htmlFor="platform_version"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ platform_version
              </Label>
              <Input
                id="platform_version"
                name="platform_version"
                defaultValue={website?.platform_version ?? ""}
                placeholder="6.4.2"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Hosting provider */}
            <div className="space-y-2">
              <Label
                htmlFor="hosting_provider"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ hosting_provider
              </Label>
              <select
                id="hosting_provider"
                name="hosting_provider"
                defaultValue={website?.hosting_provider ?? ""}
                className={selectClass}
              >
                <option value="">-- Избери --</option>
                <option value="superhosting">SuperHosting</option>
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
                <option value="other">Друг</option>
              </select>
            </div>

            {/* Hosting plan */}
            <div className="space-y-2">
              <Label
                htmlFor="hosting_plan"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ hosting_plan
              </Label>
              <Input
                id="hosting_plan"
                name="hosting_plan"
                defaultValue={website?.hosting_plan ?? ""}
                placeholder="SuperStart, Pro, Enterprise..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Hosting renewal date */}
            <div className="space-y-2">
              <Label
                htmlFor="hosting_renewal_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ hosting_renewal_date
              </Label>
              <Input
                id="hosting_renewal_date"
                name="hosting_renewal_date"
                type="date"
                defaultValue={website?.hosting_renewal_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* === Section: Домейн и SSL === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ДОМЕЙН И SSL
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Домейн и SSL сертификат
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain registrar */}
            <div className="space-y-2">
              <Label
                htmlFor="domain_registrar"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ domain_registrar
              </Label>
              <Input
                id="domain_registrar"
                name="domain_registrar"
                defaultValue={website?.domain_registrar ?? ""}
                placeholder="SuperHosting, Namecheap, Google..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Domain expiry date */}
            <div className="space-y-2">
              <Label
                htmlFor="domain_expiry_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ domain_expiry_date
              </Label>
              <Input
                id="domain_expiry_date"
                name="domain_expiry_date"
                type="date"
                defaultValue={website?.domain_expiry_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Domain auto-renew */}
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
                $ domain_auto_renew
              </Label>
              <div className="flex items-center gap-3 h-9">
                <input
                  type="hidden"
                  name="domain_auto_renew"
                  value="false"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="domain_auto_renew"
                    value="true"
                    defaultChecked={website?.domain_auto_renew ?? true}
                    className="h-4 w-4 rounded border-border text-neon focus:ring-neon/50"
                  />
                  <span className="text-sm text-foreground">
                    Автоматично подновяване
                  </span>
                </label>
              </div>
            </div>

            {/* SSL status */}
            <div className="space-y-2">
              <Label
                htmlFor="ssl_status"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ ssl_status
              </Label>
              <select
                id="ssl_status"
                name="ssl_status"
                defaultValue={website?.ssl_status ?? "active"}
                className={selectClass}
              >
                <option value="active">Активен</option>
                <option value="expired">Изтекъл</option>
                <option value="none">Няма</option>
              </select>
            </div>

            {/* SSL expiry date */}
            <div className="space-y-2">
              <Label
                htmlFor="ssl_expiry_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ ssl_expiry_date
              </Label>
              <Input
                id="ssl_expiry_date"
                name="ssl_expiry_date"
                type="date"
                defaultValue={website?.ssl_expiry_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* SSL provider */}
            <div className="space-y-2">
              <Label
                htmlFor="ssl_provider"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ ssl_provider
              </Label>
              <Input
                id="ssl_provider"
                name="ssl_provider"
                defaultValue={website?.ssl_provider ?? ""}
                placeholder="Let's Encrypt, Cloudflare, Custom..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* === Section: Cloudflare === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // CLOUDFLARE
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Cloudflare
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CF zone ID */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="cloudflare_zone_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ cloudflare_zone_id
              </Label>
              <Input
                id="cloudflare_zone_id"
                name="cloudflare_zone_id"
                defaultValue={website?.cloudflare_zone_id ?? ""}
                placeholder="Zone ID от CF Dashboard"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
              <p className="text-[10px] text-muted-foreground/40 font-mono">
                Оставете празно \— ще се опита автоматично откриване при sync
              </p>
            </div>
          </div>
        </div>

        {/* === Section: CMS === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // CMS
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              CMS достъп
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CMS admin URL */}
            <div className="space-y-2">
              <Label
                htmlFor="cms_admin_url"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ cms_admin_url
              </Label>
              <Input
                id="cms_admin_url"
                name="cms_admin_url"
                type="url"
                defaultValue={website?.cms_admin_url ?? ""}
                placeholder="https://example.bg/wp-admin"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* CMS credentials note */}
            <div className="space-y-2">
              <Label
                htmlFor="cms_credentials_note"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ cms_credentials_note
              </Label>
              <Input
                id="cms_credentials_note"
                name="cms_credentials_note"
                defaultValue={website?.cms_credentials_note ?? ""}
                placeholder="Бележка за достъпа (без пароли!)"
                className="bg-background border-border focus:border-neon/50"
              />
              <p className="text-[10px] text-muted-foreground/40 font-mono">
                Не записвайте пароли тук. Използвайте password manager.
              </p>
            </div>
          </div>
        </div>

        {/* === Section: Analytics === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ANALYTICS
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Analytics и тракинг
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GA4 */}
            <div className="space-y-2">
              <Label
                htmlFor="ga4_property_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ ga4_property_id
              </Label>
              <Input
                id="ga4_property_id"
                name="ga4_property_id"
                defaultValue={website?.ga4_property_id ?? ""}
                placeholder="G-XXXXXXXXXX"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* GSC */}
            <div className="space-y-2">
              <Label
                htmlFor="gsc_property_url"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ gsc_property_url
              </Label>
              <Input
                id="gsc_property_url"
                name="gsc_property_url"
                defaultValue={website?.gsc_property_url ?? ""}
                placeholder="https://example.bg"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Facebook Pixel */}
            <div className="space-y-2">
              <Label
                htmlFor="facebook_pixel_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ facebook_pixel_id
              </Label>
              <Input
                id="facebook_pixel_id"
                name="facebook_pixel_id"
                defaultValue={website?.facebook_pixel_id ?? ""}
                placeholder="1234567890123456"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Contact email */}
            <div className="space-y-2">
              <Label
                htmlFor="contact_email"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ contact_email
              </Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={website?.contact_email ?? ""}
                placeholder="info@example.bg"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* === Section: Бележки и тагове === */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Бележки и тагове
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 gap-4">
            {/* Tags */}
            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ tags
              </Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={website?.tags?.join(", ") ?? ""}
                placeholder="wordpress, поддръжка, seo (разделени със запетая)"
                className="bg-background border-border focus:border-neon/50"
              />
              <p className="text-[10px] text-muted-foreground/40 font-mono">
                Разделете таговете със запетая
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={website?.notes ?? ""}
                placeholder="Вътрешни бележки за сайта..."
                rows={4}
                className="bg-background border-border focus:border-neon/50 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={
              mode === "edit" && website
                ? `/admin/crm/websites/${website.id}`
                : "/admin/crm/websites"
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
                {mode === "edit" ? "Запази промените" : "Създай сайт"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
