import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { audit, answers, email } = await req.json()
  const pct = Math.round((audit.total_score / audit.max_score) * 100)

  const RISK_LABELS: Record<string, string> = {
    critical: 'KRİTİK RİSK', high: 'YÜKSEK RİSK',
    medium: 'ORTA RİSK', low: 'DÜŞÜK RİSK', compliant: 'UYUMLU'
  }

  const rows = answers.map((a: any) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:12px;color:#6b7280;">${a.question_id}</td>
      <td style="padding:6px 10px;font-size:12px;">${a.question_text}</td>
      <td style="padding:6px 10px;font-size:12px;font-weight:bold;color:${
        a.answer === 'evet' ? '#16a34a' : a.answer === 'hayir' ? '#dc2626' : '#ca8a04'
      };">
        ${a.answer === 'evet' ? '✓ Evet' : a.answer === 'hayir' ? '✗ Hayır' : a.answer === 'kismi' ? '~ Kısmi' : 'N/A'}
      </td>
      <td style="padding:6px 10px;font-size:12px;font-weight:bold;">${a.score}/${a.max_score}</td>
    </tr>
  `).join('')

  const html = `
  <div style="font-family:sans-serif;max-width:700px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:32px;border-radius:12px 12px 0 0;color:#fff;">
      <div style="font-size:24px;font-weight:800;">🛡️ FoodGuard — Denetim Raporu</div>
      <div style="opacity:.8;margin-top:6px;">${audit.companies?.name} · ${audit.audit_date}</div>
      <div style="margin-top:16px;font-size:40px;font-weight:900;">
        ${audit.total_score}
        <span style="font-size:18px;opacity:.6"> / ${audit.max_score} puan</span>
      </div>
      <div style="margin-top:8px;background:rgba(255,255,255,0.2);display:inline-block;padding:4px 14px;border-radius:20px;font-weight:bold;">
        ${RISK_LABELS[audit.risk_level] || audit.risk_level} · %${pct}
      </div>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:8px 10px;font-size:11px;color:#6b7280;text-transform:uppercase;">#</th>
            <th style="text-align:left;padding:8px 10px;font-size:11px;color:#6b7280;text-transform:uppercase;">Soru</th>
            <th style="text-align:left;padding:8px 10px;font-size:11px;color:#6b7280;text-transform:uppercase;">Cevap</th>
            <th style="text-align:left;padding:8px 10px;font-size:11px;color:#6b7280;text-transform:uppercase;">Puan</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#f9fafb;padding:16px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center;font-size:12px;color:#9ca3af;">
      FoodGuard Gıda Güvenliği Denetim Sistemi — Otomatik rapor
    </div>
  </div>`

  try {
    await resend.emails.send({
      from: 'FoodGuard <onboarding@resend.dev>',
      to: email,
      subject: `Denetim Raporu: ${audit.companies?.name} — ${RISK_LABELS[audit.risk_level]}`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
