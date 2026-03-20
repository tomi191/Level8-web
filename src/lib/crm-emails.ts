import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "LEVEL 8 <noreply@level8.bg>";
const ADMIN_EMAIL = "contact@level8.bg";

const BANK_DETAILS = {
  bankName: "\u0423\u043D\u0438\u043A\u0440\u0435\u0434\u0438\u0442 \u0411\u0443\u043B\u0431\u0430\u043D\u043A",
  iban: "BG00UNCR00000000000000", // placeholder
  bic: "UNCRBGSF",
  holder: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBgAmount(amount: number): string {
  return (
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u043B\u0432."
  );
}

function wrapInTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(57,255,20,0.15);">
          <span style="font-size:20px;font-weight:700;color:#39ff14;letter-spacing:2px;">LEVEL 8</span>
          <span style="font-size:10px;color:rgba(57,255,20,0.4);margin-left:8px;letter-spacing:3px;text-transform:uppercase;">${escapeHtml(title)}</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
            \u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414 &bull; \u0415\u0418\u041A 208697165 &bull; \u0433\u0440. \u0412\u0430\u0440\u043D\u0430
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.25);">
            +359 895 552 550 &bull; contact@level8.bg
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ============================================================
// Invoice Email HTML (for sending invoice with PDF attachment)
// ============================================================

export function generateInvoiceEmailHtml(params: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  clientName: string;
  description: string | null;
}): string {
  const { invoiceNumber, issueDate, dueDate, amount, vatAmount, totalAmount, clientName, description } = params;

  const formattedIssueDate = new Date(issueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDueDate = new Date(dueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <p style="margin:0 0 24px;">
      \u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u043E \u0438\u0437\u043F\u0440\u0430\u0449\u0430\u043C\u0435 \u0444\u0430\u043A\u0442\u0443\u0440\u0430
      <strong style="color:#39ff14;">${escapeHtml(invoiceNumber)}</strong>
      \u043A\u044A\u043C ${escapeHtml(clientName)}.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${escapeHtml(invoiceNumber)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0414\u0430\u0442\u0430 \u043D\u0430 \u0438\u0437\u0434\u0430\u0432\u0430\u043D\u0435:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${formattedIssueDate}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0430\u0434\u0435\u0436:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${formattedDueDate}</td>
          </tr>
          ${description ? `
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(description)}</td>
          </tr>` : ""}
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0421\u0443\u043C\u0430 \u0431\u0435\u0437 \u0414\u0414\u0421:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${formatBgAmount(amount)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0414\u0414\u0421 (20%):</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${formatBgAmount(vatAmount)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(totalAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">
          \u0411\u0430\u043D\u043A\u043E\u0432\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:3px 0;">\u0411\u0430\u043D\u043A\u0430:</td>
            <td style="color:#ffffff;font-size:13px;text-align:right;padding:3px 0;">${BANK_DETAILS.bankName}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:3px 0;">IBAN:</td>
            <td style="color:#39ff14;font-size:13px;font-family:monospace;text-align:right;padding:3px 0;">${BANK_DETAILS.iban}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:3px 0;">BIC:</td>
            <td style="color:#ffffff;font-size:13px;font-family:monospace;text-align:right;padding:3px 0;">${BANK_DETAILS.bic}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:3px 0;">\u0422\u0438\u0442\u0443\u043B\u044F\u0440:</td>
            <td style="color:#ffffff;font-size:13px;text-align:right;padding:3px 0;">${BANK_DETAILS.holder}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:3px 0;">\u041E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435:</td>
            <td style="color:#ffffff;font-size:13px;text-align:right;padding:3px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 ${escapeHtml(invoiceNumber)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);">
      \u0424\u0430\u043A\u0442\u0443\u0440\u0430\u0442\u0430 \u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0430 \u043A\u0430\u0442\u043E PDF \u0444\u0430\u0439\u043B \u043A\u044A\u043C \u0442\u043E\u0432\u0430 \u0441\u044A\u043E\u0431\u0449\u0435\u043D\u0438\u0435.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;

  return wrapInTemplate("\u0424\u0430\u043A\u0442\u0443\u0440\u0430", body);
}

// ============================================================
// Overdue Invoice Notification (to client)
// ============================================================

export async function sendOverdueNotification(params: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  daysOverdue: number;
}): Promise<void> {
  const { clientEmail, clientName, invoiceNumber, totalAmount, dueDate, daysOverdue } = params;

  const formattedDate = new Date(dueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <p style="margin:0 0 24px;">
      \u0418\u043D\u0444\u043E\u0440\u043C\u0438\u0440\u0430\u043C\u0435 \u0412\u0438, \u0447\u0435 \u0444\u0430\u043A\u0442\u0443\u0440\u0430
      <strong style="color:#39ff14;">${escapeHtml(invoiceNumber)}</strong>
      \u0435 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0441 <strong style="color:#ff4444;">${daysOverdue}</strong> \u0434\u043D\u0438.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041A\u043B\u0438\u0435\u043D\u0442:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(clientName)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${escapeHtml(invoiceNumber)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0430\u0434\u0435\u0436:</td>
            <td style="color:#ff4444;font-size:14px;text-align:right;padding:4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(totalAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;">
      \u041C\u043E\u043B\u044F, \u0438\u0437\u0432\u044A\u0440\u0448\u0435\u0442\u0435 \u043F\u043B\u0430\u0449\u0430\u043D\u0435\u0442\u043E \u0432\u044A\u0432 \u0432\u044A\u0437\u043C\u043E\u0436\u043D\u043E \u043D\u0430\u0439-\u043A\u0440\u0430\u0442\u044A\u043A \u0441\u0440\u043E\u043A. \u0410\u043A\u043E \u0432\u0435\u0447\u0435 \u0441\u0442\u0435 \u043F\u043B\u0430\u0442\u0438\u043B\u0438, \u043C\u043E\u043B\u044F \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0430\u0439\u0442\u0435 \u0442\u043E\u0432\u0430 \u0441\u044A\u043E\u0431\u0449\u0435\u043D\u0438\u0435.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;

  const html = wrapInTemplate("\u0424\u0430\u043A\u0442\u0443\u0440\u0430", body);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject: `\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430 ${invoiceNumber} - Level 8`,
    html,
  });
}

// ============================================================
// Overdue Escalation Email Templates (3 levels)
// ============================================================

export function generateOverdueEscalationHtml(
  level: 1 | 2 | 3,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  daysOverdue: number
): string {
  const formattedDate = new Date(dueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const safeInvoiceNumber = escapeHtml(invoiceNumber);

  if (level === 1) {
    // Friendly reminder — 3 days overdue
    const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <p style="margin:0 0 24px;">
      \u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043C\u0435 \u0412\u0438, \u0447\u0435 \u0444\u0430\u043A\u0442\u0443\u0440\u0430
      <strong style="color:#39ff14;">${safeInvoiceNumber}</strong>
      \u0435 \u0441 \u0438\u0437\u0442\u0435\u043A\u044A\u043B \u0441\u0440\u043E\u043A \u043E\u0442 <strong style="color:#ffaa00;">${daysOverdue}</strong> \u0434\u043D\u0438.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${safeInvoiceNumber}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0430\u0434\u0435\u0436:</td>
            <td style="color:#ffaa00;font-size:14px;text-align:right;padding:4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(amount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;">
      \u041C\u043E\u043B\u044F, \u0438\u0437\u0432\u044A\u0440\u0448\u0435\u0442\u0435 \u043F\u043B\u0430\u0449\u0430\u043D\u0435\u0442\u043E \u0432\u044A\u0432 \u0432\u044A\u0437\u043C\u043E\u0436\u043D\u043E \u043D\u0430\u0439-\u043A\u0440\u0430\u0442\u044A\u043A \u0441\u0440\u043E\u043A.
      \u0410\u043A\u043E \u0432\u0435\u0447\u0435 \u0441\u0442\u0435 \u043F\u043B\u0430\u0442\u0438\u043B\u0438, \u043C\u043E\u043B\u044F \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0430\u0439\u0442\u0435 \u0442\u043E\u0432\u0430 \u0441\u044A\u043E\u0431\u0449\u0435\u043D\u0438\u0435.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;
    return wrapInTemplate("\u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435", body);
  }

  if (level === 2) {
    // Firm reminder — 7 days overdue
    const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <p style="margin:0 0 24px;">
      \u041C\u043E\u043B\u044F, \u043E\u0431\u044A\u0440\u043D\u0435\u0442\u0435 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u043D\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430
      <strong style="color:#39ff14;">${safeInvoiceNumber}</strong>.
      \u041F\u043B\u0430\u0449\u0430\u043D\u0435\u0442\u043E \u0435 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E \u0441 <strong style="color:#ff6600;">${daysOverdue}</strong> \u0434\u043D\u0438.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,102,0,0.05);border:1px solid rgba(255,102,0,0.25);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${safeInvoiceNumber}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0430\u0434\u0435\u0436:</td>
            <td style="color:#ff6600;font-size:14px;text-align:right;padding:4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0438\u0435:</td>
            <td style="color:#ff6600;font-size:14px;font-weight:700;text-align:right;padding:4px 0;">${daysOverdue} \u0434\u043D\u0438</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(amount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;">
      \u041C\u043E\u043B\u044F, \u0443\u0440\u0435\u0434\u0435\u0442\u0435 \u043F\u043B\u0430\u0449\u0430\u043D\u0435\u0442\u043E \u0432 \u043D\u0430\u0439-\u043A\u0440\u0430\u0442\u044A\u043A \u0441\u0440\u043E\u043A, \u0437\u0430 \u0434\u0430 \u0438\u0437\u0431\u0435\u0433\u043D\u0435\u0442\u0435 \u0434\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u043D\u0438 \u043D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0438\u044F.
      \u041F\u0440\u0438 \u0432\u044A\u043F\u0440\u043E\u0441\u0438 \u0441\u0435 \u0441\u0432\u044A\u0440\u0436\u0435\u0442\u0435 \u0441 \u043D\u0430\u0441 \u043D\u0430 contact@level8.bg.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;
    return wrapInTemplate("\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430", body);
  }

  // Level 3 — Final notice — 14 days overdue
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <div style="background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.3);border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#ff4444;text-transform:uppercase;letter-spacing:1px;">
        \u041F\u041E\u0421\u041B\u0415\u0414\u041D\u041E \u041D\u0410\u041F\u041E\u041C\u041D\u042F\u041D\u0415
      </p>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">
        \u0424\u0430\u043A\u0442\u0443\u0440\u0430 <strong style="color:#39ff14;">${safeInvoiceNumber}</strong>
        \u0435 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0441 <strong style="color:#ff4444;">${daysOverdue}</strong> \u0434\u043D\u0438.
      </p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,68,68,0.05);border:1px solid rgba(255,68,68,0.25);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${safeInvoiceNumber}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0430\u0434\u0435\u0436:</td>
            <td style="color:#ff4444;font-size:14px;text-align:right;padding:4px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0438\u0435:</td>
            <td style="color:#ff4444;font-size:14px;font-weight:700;text-align:right;padding:4px 0;">${daysOverdue} \u0434\u043D\u0438</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(amount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);">
      \u0422\u043E\u0432\u0430 \u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u043E\u0442\u043E \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u043D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435 \u0437\u0430 \u0442\u0430\u0437\u0438 \u0444\u0430\u043A\u0442\u0443\u0440\u0430.
      \u041C\u043E\u043B\u044F, \u0441\u0432\u044A\u0440\u0436\u0435\u0442\u0435 \u0441\u0435 \u0441 \u043D\u0430\u0441 \u043D\u0430 contact@level8.bg \u0438\u043B\u0438 +359 895 552 550, \u0430\u043A\u043E \u0438\u043C\u0430\u0442\u0435 \u0432\u044A\u043F\u0440\u043E\u0441\u0438.
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;
  return wrapInTemplate("\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u043E \u043D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435", body);
}

export async function sendOverdueEscalation(params: {
  clientEmail: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  daysOverdue: number;
  level: 1 | 2 | 3;
}): Promise<void> {
  const { clientEmail, invoiceNumber, totalAmount, dueDate, daysOverdue, level } = params;

  const subjectPrefix =
    level === 1
      ? "\u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435"
      : level === 2
      ? "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430"
      : "\u041F\u041E\u0421\u041B\u0415\u0414\u041D\u041E \u041D\u0410\u041F\u041E\u041C\u041D\u042F\u041D\u0415";

  const html = generateOverdueEscalationHtml(level, invoiceNumber, totalAmount, dueDate, daysOverdue);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject: `${subjectPrefix}: \u0444\u0430\u043A\u0442\u0443\u0440\u0430 ${invoiceNumber} - Level 8`,
    html,
  });
}

// ============================================================
// Reminder Notification Email
// ============================================================

export async function sendReminderNotification(params: {
  recipientEmail: string;
  title: string;
  description: string | null;
  dueDate: string;
  entityType: string;
  entityLabel: string;
}): Promise<void> {
  const { recipientEmail, title, description, dueDate, entityType, entityLabel } = params;

  const formattedDate = new Date(dueDate).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const entityLabels: Record<string, string> = {
    client: "\u041A\u043B\u0438\u0435\u043D\u0442",
    website: "\u0421\u0430\u0439\u0442",
    invoice: "\u0424\u0430\u043A\u0442\u0443\u0440\u0430",
    domain: "\u0414\u043E\u043C\u0435\u0439\u043D",
    service: "\u0423\u0441\u043B\u0443\u0433\u0430",
  };

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      CRM \u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0417\u0430\u0433\u043B\u0430\u0432\u0438\u0435:</td>
            <td style="color:#39ff14;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(title)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">${escapeHtml(entityLabels[entityType] || entityType)}:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(entityLabel)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0414\u0430\u0442\u0430:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${formattedDate}</td>
          </tr>
          ${description ? `
          <tr>
            <td colspan="2" style="color:rgba(255,255,255,0.6);font-size:13px;padding:8px 0 0;border-top:1px solid rgba(255,255,255,0.1);">${escapeHtml(description)}</td>
          </tr>` : ""}
        </table>
      </td></tr>
    </table>`;

  const html = wrapInTemplate("\u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435", body);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `CRM \u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435: ${title} - Level 8`,
    html,
  });
}

// ============================================================
// New Invoice Notification (to client)
// ============================================================

export async function sendNewInvoiceNotification(params: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  serviceName: string;
  totalAmount: number;
  period: string;
}): Promise<void> {
  const { clientEmail, clientName, invoiceNumber, serviceName, totalAmount, period } = params;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0417\u0434\u0440\u0430\u0432\u0435\u0439\u0442\u0435,
    </p>
    <p style="margin:0 0 24px;">
      \u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0430 \u0435 \u043D\u043E\u0432\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430 \u0437\u0430 \u0443\u0441\u043B\u0443\u0433\u0430\u0442\u0430
      <strong style="color:#39ff14;">${escapeHtml(serviceName)}</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041A\u043B\u0438\u0435\u043D\u0442:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(clientName)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u0424\u0430\u043A\u0442\u0443\u0440\u0430 \u2116:</td>
            <td style="color:#39ff14;font-size:14px;font-family:monospace;text-align:right;padding:4px 0;">${escapeHtml(invoiceNumber)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:4px 0;">\u041F\u0435\u0440\u0438\u043E\u0434:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(period)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">\u041E\u0431\u0449\u043E:</td>
            <td style="color:#ffffff;font-size:18px;font-weight:700;text-align:right;padding:8px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">${formatBgAmount(totalAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">
      \u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435,<br>\u0415\u043A\u0438\u043F\u044A\u0442 \u043D\u0430 Level 8
    </p>`;

  const html = wrapInTemplate("\u041D\u043E\u0432\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430", body);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject: `\u041D\u043E\u0432\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430 ${invoiceNumber} - Level 8`,
    html,
  });
}

// ============================================================
// Admin Weekly Digest
// ============================================================

export async function sendAdminDigest(params: {
  mrr: number;
  revenueThisMonth: number;
  overdueCount: number;
  overdueAmount: number;
  upcomingRenewals: number;
  generatedThisWeek: number;
}): Promise<void> {
  const { mrr, revenueThisMonth, overdueCount, overdueAmount, upcomingRenewals, generatedThisWeek } = params;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#ffffff;">
      \u0421\u0435\u0434\u043C\u0438\u0447\u0435\u043D \u043E\u0442\u0447\u0435\u0442 \u043D\u0430 CRM
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.15);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:6px 0;">MRR:</td>
            <td style="color:#39ff14;font-size:16px;font-weight:700;text-align:right;padding:6px 0;">${formatBgAmount(mrr)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:6px 0;">\u041F\u0440\u0438\u0445\u043E\u0434\u0438 (\u043C\u0435\u0441\u0435\u0446):</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:6px 0;">${formatBgAmount(revenueThisMonth)}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:6px 0;">\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0438 \u0442\u0430\u0437\u0438 \u0441\u0435\u0434\u043C\u0438\u0446\u0430:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:6px 0;">${generatedThisWeek}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:6px 0;border-top:1px solid rgba(255,255,255,0.1);">\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0438:</td>
            <td style="color:${overdueCount > 0 ? "#ff4444" : "#ffffff"};font-size:14px;text-align:right;padding:6px 0;border-top:1px solid rgba(255,255,255,0.1);">${overdueCount} (${formatBgAmount(overdueAmount)})</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:12px;padding:6px 0;">\u041F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0438 \u043F\u043E\u0434\u043D\u043E\u0432\u044F\u0432\u0430\u043D\u0438\u044F:</td>
            <td style="color:#ffffff;font-size:14px;text-align:right;padding:6px 0;">${upcomingRenewals}</td>
          </tr>
        </table>
      </td></tr>
    </table>`;

  const html = wrapInTemplate("CRM Digest", body);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `CRM \u0441\u0435\u0434\u043C\u0438\u0447\u0435\u043D \u043E\u0442\u0447\u0435\u0442 - MRR ${formatBgAmount(mrr)}`,
    html,
  });
}
