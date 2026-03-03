'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, getRiskLevel } from '@/lib/questions'
import toast from 'react-hot-toast'

export default function AuditDetailPage() {
  const { id } = useParams()
  const [audit, setAudit] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [mailTo, setMailTo] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.from('audits').select('*, companies(*)').eq('id', id).single()
      .then(({ data }) => data && setAudit(data))
    supabase.from('audit_answers').select('*').eq('audit_id', id).order('question_id')
      .then(({ data }) => data && setAnswers(data))
  }, [id])

  async function sendMail() {
    if (!mailTo) { toast.error('E-posta adresi girin'); return }
    setSending(true)
    const res = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId: id, email: mailTo, audit, answers })
    })
    const data = await res.json()
    if (data.ok) {
      toast.success('Rapor gönderildi!')
      await supabase.from('audits').update({
        report_sent_to: [mailTo],
        report_sent_at: new Date().toISOString()
      }).eq('id', id)
    } else {
      toast.error('Mail gönderilemedi: ' + data.error)
    }
    setSending(false)
  }

  if (!audit) return <div className="p-8 text-gray-400">Yükleniyor...</div>

  const riskLevel = getRiskLevel(audit.total_score, audit.max_score)
  const pct = Math.round((audit.total_score / audit.max_score) * 100)
  const categories = [...new Set(QUESTIONS.map(q => q.category))]

  return (
    <div className="p-8 max-w-4xl">
      {/* Aksiyonlar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denetim Raporu</h1>
          <p className="text-gray-500 text-sm">{audit.companies?.name} · {audit.audit_date}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
            🖨️ PDF İndir
          </button>
          <input value={mailTo} onChange={e => setMailTo(e.target.value)}
            placeholder="mail@firma.com"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 w-44" />
          <button onClick={sendMail} disabled={sending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-green-700">
            {sending ? '...' : '📧 Gönder'}
          </button>
        </div>
      </div>

      {/* Sonuç kartı */}
      <div className="bg-gradient-to-br from-green-800 to-green-600 text-white rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm opacity-70 mb-1">{audit.companies?.name}</div>
            <div className="text-5xl font-black">{audit.total_score}</div>
            <div className="text-sm opacity-60">/ {audit.max_score} puan (%{pct})</div>
          </div>
          <div style={{ background: riskLevel.bg, color: riskLevel.color }}
            className="px-4 py-2 rounded-xl font-bold text-sm">
            {riskLevel.label}
          </div>
        </div>
        <div className="mt-4 text-sm opacity-80">{riskLevel.description}</div>
      </div>

      {/* Kategori performans */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Kategori Performansı</h2>
        {categories.map(cat => {
          const qs = answers.filter(a => a.category === cat)
          const score = qs.reduce((t, a) => t + a.score, 0)
          const max = qs.reduce((t, a) => t + a.max_score, 0)
          const p = max > 0 ? Math.round((score / max) * 100) : 0
          const barColor = p >= 80 ? '#16a34a' : p >= 50 ? '#ca8a04' : '#dc2626'
          return (
            <div key={cat} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{cat}</span>
                <span className="font-bold" style={{ color: barColor }}>{score}/{max} (%{p})</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${p}%`, background: barColor }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Cevaplar tablosu */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Tüm Cevaplar</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['#', 'Kategori', 'Soru', 'Cevap', 'Puan', 'Not'].map(h => (
                <th key={h} className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {answers.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{a.question_id}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{a.category}</td>
                <td className="px-4 py-2.5 text-gray-800">{a.question_text}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                    ${a.answer === 'evet'  ? 'bg-green-100 text-green-700'  :
                      a.answer === 'hayir' ? 'bg-red-100 text-red-700'      :
                      a.answer === 'kismi' ? 'bg-yellow-100 text-yellow-700': 'bg-gray-100 text-gray-500'}`}>
                    {a.answer === 'evet' ? '✓ Evet' : a.answer === 'hayir' ? '✗ Hayır' : a.answer === 'kismi' ? '~ Kısmi' : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-bold text-green-700">{a.score}/{a.max_score}</td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{a.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
