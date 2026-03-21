import type { CrmContractWithClient } from "@/types/crm";

/**
 * Generate print-ready HTML for a maintenance contract.
 * Uses A4 @page CSS — user prints from browser (Ctrl+P → Save as PDF).
 */
export function generateMaintenanceContractHtml(
  contract: CrmContractWithClient
): string {
  const c = contract;
  const client = c.crm_clients;
  const isVariantB = c.variant === "b";
  const variantLabel = isVariantB ? "Б: Пълна поддръжка" : "А: Стандартна поддръжка";
  const price = c.monthly_price ?? 0;
  const priceText = `${price} (${numberToWords(price)}) евро`;
  const hourlyRate = c.hourly_rate ?? 40;
  const tripleRate = hourlyRate * 3;
  const includedHours = c.included_hours ?? 0;
  const minMonths = c.minimum_period_months ?? 6;
  const payDay = c.payment_due_day ?? 10;
  const techStackText = (c.tech_stack ?? []).join(", ") || "N/A";
  const effectiveDate = c.effective_date ? formatDateBg(c.effective_date) : "............";

  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="utf-8">
<style>
@page { size: A4; margin: 2cm 2.5cm; }
@media print { body { -webkit-print-color-adjust: exact; } }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12pt; line-height: 1.65; color: #1a1a1a; max-width: 100%; margin: 0; padding: 0; }
h1 { text-align: center; font-size: 20pt; margin-bottom: 2px; color: #000; letter-spacing: 2px; }
h2 { font-size: 14pt; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 28px; color: #000; page-break-after: avoid; }
h3 { font-size: 12pt; margin-top: 18px; color: #111; page-break-after: avoid; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; page-break-inside: avoid; }
th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; vertical-align: top; }
th { background-color: #f0f0f0; font-weight: 600; color: #000; }
hr { border: none; border-top: 1px solid #ccc; margin: 22px 0; }
ul { margin: 8px 0; padding-left: 24px; }
li { margin-bottom: 4px; }
strong { color: #000; }
p { margin: 6px 0; }
.page-break { page-break-before: always; }
.sig-table td { border: none; width: 50%; padding: 8px 0; vertical-align: top; }
</style>
</head>
<body>

<h1>ДОГОВОР</h1>
<h2 style="text-align:center;border:none;">за абонаментно обслужване на софтуерна платформа</h2>

<hr>

<p>Днес, ${effectiveDate} г., в гр. Варна, между:</p>

<p><strong>1. "${esc(client.company_name)}"</strong>${client.eik ? `, ЕИК: ${esc(client.eik)}` : ""}${client.address ? `, със седалище и адрес на управление: ${client.city ? `гр. ${esc(client.city)}, ` : ""}${esc(client.address)}` : ""}${client.contact_person ? `, представлявано от ${esc(client.contact_person)}` : ""}, наричано по-долу <strong>АБОНАТ</strong>, от една страна,</p>

<p>и</p>

<p><strong>2. "ЛЕВЕЛ 8" ЕООД</strong>, ЕИК: 208697165, със седалище и адрес на управление: гр. Варна, представлявано от Томи Димитров Сапунджиев, наричано по-долу <strong>ИЗПЪЛНИТЕЛ</strong>, от друга страна,</p>

<p>се сключи настоящият договор за следното:</p>

<hr>

<h2>1. ПРЕДМЕТ НА ДОГОВОРА</h2>

<p>1.1. АБОНАТЪТ възлага, а ИЗПЪЛНИТЕЛЯТ приема да извършва абонаментно обслужване и техническа поддръжка на софтуерната платформа <strong>${esc(c.platform_name || "N/A")}</strong>${c.platform_url ? ` (достъпна на адрес ${esc(c.platform_url)})` : ""}.</p>

<p>1.2. Обхватът на дейностите е описан в <strong>Приложение 1</strong>, неразделна част от настоящия договор.</p>

<hr>

<h2>2. ЦЕНИ И ПЛАЩАНИЯ — Вариант ${variantLabel}</h2>

<p>2.1. АБОНАТЪТ заплаща на ИЗПЪЛНИТЕЛЯ месечна абонаментна такса в размер на <strong>${priceText}</strong> за всеки месец, платима до <strong>${payDay}-то число</strong> на текущия месец.</p>

${isVariantB ? `<p>2.2. В месечната такса са включени <strong>${includedHours} (${numberToWords(includedHours)}) работни часа</strong> за дейности по поддръжка, оптимизация и отстраняване на проблеми. Неизползвани часове не се прехвърлят за следващ месец.</p>

<p>2.3. Работа над включените ${includedHours} часа се заплаща по <strong>${hourlyRate} евро на започнат работен час</strong>.</p>` : `<p>2.2. Работа по заявки извън абонамента се заплаща по <strong>${hourlyRate} евро на започнат работен час</strong>.</p>`}

<p>2.${isVariantB ? "4" : "3"}. Плащането се извършва по банков път по сметка на ИЗПЪЛНИТЕЛЯ.</p>

<p>2.${isVariantB ? "5" : "4"}. Всички цени в настоящия договор са <strong>без включен ДДС</strong>.</p>

<p>2.${isVariantB ? "6" : "5"}. При забава на плащане с повече от 15 календарни дни, ИЗПЪЛНИТЕЛЯТ има право да преустанови предоставянето на услугите.</p>

<hr>

<h2>3. ПРАВА И ЗАДЪЛЖЕНИЯ НА ИЗПЪЛНИТЕЛЯ</h2>

<p>3.1. ИЗПЪЛНИТЕЛЯТ се задължава да осигурява наблюдение на сървърната инфраструктура и интеграциите (${techStackText}).</p>

<p>3.2. Време за реакция: до <strong>12 часа</strong> за критични проблеми, до <strong>${isVariantB ? "12" : "24"} часа</strong> за нормални проблеми (работни дни, 09:00-18:00).</p>

<p>3.3. ИЗПЪЛНИТЕЛЯТ се задължава да не разкрива поверителна информация.</p>

<p>3.4. ИЗПЪЛНИТЕЛЯТ извършва дейностите дистанционно.</p>

<hr>

<h2>4. ПРАВА И ЗАДЪЛЖЕНИЯ НА АБОНАТА</h2>

<p>4.1. АБОНАТЪТ <strong>да не допуска</strong> неоторизирани промени по кода или инфраструктурата. При нарушение — ставка <strong>${tripleRate} евро/час</strong>.</p>

<p>4.2. Заявки за проблеми — <strong>само писмено</strong> по електронна поща${client.email ? ` до ${esc(client.email)}` : ""}.</p>

<p>4.3. АБОНАТЪТ осигурява необходимия достъп до системите.</p>

<hr>

<h2>5. ОБХВАТ И ОГРАНИЧЕНИЯ</h2>

<p>5.1. Договорът покрива <strong>поддръжка на съществуващия програмен код</strong>: бъгове, оптимизации, мониторинг, консултации.</p>

<p>5.2. <strong>НЕ покрива</strong> разработка на нови функционалности — те се договарят отделно.</p>

<hr>

<h2>6. СРОК И ПРЕКРАТЯВАНЕ</h2>

<p>6.1. Минимален срок: <strong>${minMonths} месеца</strong> от датата на подписване.</p>

<p>6.2. ${c.auto_renew ? "След изтичане — автоматично продължение за по 1 месец с 30-дневно предизвестие." : "Договорът не се подновява автоматично."}</p>

<p>6.3. При предсрочно прекратяване от АБОНАТА — неустойка за оставащите месеци.</p>

<hr>

<h2>7. КОНФИДЕНЦИАЛНОСТ</h2>

<p>Двете страни пазят поверителност за срок от <strong>2 години</strong> след прекратяване.</p>

<hr>

<h2>8. СПОРОВЕ</h2>

<p>Спорове се решават по взаимно споразумение или пред компетентния съд в гр. Варна.</p>

<hr>

<table class="sig-table" style="margin-top:40px;">
<tr>
<td>
<strong>АБОНАТ:</strong><br>
${esc(client.company_name)}<br>
${client.eik ? `ЕИК: ${esc(client.eik)}<br>` : ""}
${client.contact_person ? `Представител: ${esc(client.contact_person)}<br>` : ""}
Подпис: _________________<br>
Дата: _________________
</td>
<td>
<strong>ИЗПЪЛНИТЕЛ:</strong><br>
"ЛЕВЕЛ 8" ЕООД<br>
ЕИК: 208697165<br>
Представител: Томи Сапунджиев<br>
Подпис: _________________<br>
Дата: _________________
</td>
</tr>
</table>

</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateBg(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function numberToWords(n: number): string {
  const words: Record<number, string> = {
    0: "нула", 1: "един", 2: "два", 3: "три", 4: "четири", 5: "пет",
    6: "шест", 7: "седем", 8: "осем", 9: "девет", 10: "десет",
    20: "двадесет", 30: "тридесет", 40: "четиридесет", 50: "петдесет",
    100: "сто", 200: "двеста", 300: "триста", 400: "четиристотин", 450: "четиристотин и петдесет",
    500: "петстотин", 1000: "хиляда",
  };
  return words[n] || String(n);
}
