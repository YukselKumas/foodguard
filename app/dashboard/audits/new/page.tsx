'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, getRiskLevel } from '@/lib/questions'
import toast from 'react-hot-toast'

const CATEGORIES = [...new Set(QUESTIONS.map(q => q.category))]

export default function NewAuditPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [companies, setCompanies] = useState<any[]>([])
  const [companyId, setCompanyId] = useState(params.get('company') || '')
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('companies').select('id, name')
      .then(({ data }) => data && setCompanies(data))
  }, [])

  const totalScore = QUESTIONS.reduce((t, q) =>
    t + (answers[q.id] === 'evet' ? q.score : answers[q.id] === 'kismi' ? Math.floor(q.score / 2) : 0), 0)
  const maxScore = QUESTIONS.reduce((t, q) => t + q.score, 0)
  const answered = Object.keys(answers).length
  const allAnswered = answered === QUESTIONS.length

  async function save() {
    if (!companyId) { toast.error('Lütfen firma seçin'); return }
    if (!allAnswered) { toast.error('Tüm soruları cevaplayın'); return }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()
    const riskLevel = getRiskLevel(totalScore, maxScore)

    const { data: audit, error } = await supabase.from('audits').insert({
      company_id: companyId,
      auditor_id: user!.id,
      tenant_id: userData?.tenant_id,
      audit_date: auditDate,
      total_score: totalScore,
      max_score: maxScore,
      risk_level: riskLevel.key,
      status: 'completed',
    }).select().single()

    if (error) { toast.error('Hata: ' + error.message); setSaving(false); return }

    const answerRows = QUESTIONS.map(q => ({
      audit_id: audit.id,
      question_id: q.id,
      question_text: q.text,
      category: q.category,
      answer: answers[q.id],
      score: answers[q.id] === 'evet' ? q.score : answers[q.id] === 'kismi' ? Math.floor(q.score / 2) : 0,
      max_score: q.score,
      note: notes[q.id] || null,
    }))

    await supabase.from('audit_answers').insert(answerRows)
    toast.success('Denetim kaydedildi!')
    router.push(`/dashboard/audits/${audit.id}`)
  }

  const catQs = QUESTIONS.filter(q => q.category === activeCategory)
  const catAnswered = catQs.filter(q => answers[q.id]).length

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sol panel */}
      <div className="w-52 border-r border-gray-100 bg-white flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">İlerleme</div>
          <div className="text-lg font-bold text-green-700">{answered}/{QUESTIONS.length}</div>
          <div className="h-2 bg-gray-100 rounded-full mt-2">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Anlık: {totalScore}/{maxScore} puan</div>
        </div>
        <div className="p-2 space-y-1">
          {CATEGORIES.map(cat => {
            const qs = QUESTIONS.filter(q => q.category === cat)
            const done = qs.filter(q => answers[q.id]).length
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex justify-between items-center
                  ${activeCategory === cat ? 'bg-green-50 text-green-700 font-bold border-l-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="leading-tight">{cat}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${done === qs.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {done}/{qs.length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ana içerik */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Firma *</label>
            <select value={companyId} onChange={e => setCompanyId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
              <option value="">Firma seçin</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tarih</label>
            <input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <button onClick={save} disabled={!allAnswered || !companyId || saving}
            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-green-700">
            {saving ? 'Kaydediliyor...' : '💾 Kaydet & Tamamla'}
          </button>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {activeCategory}
          <span className="text-sm font-normal text-gray-400 ml-2">({catAnswered}/{catQs.length})</span>
        </h2>

        <div className="space-y-3">
          {catQs.map(q => {
            const a = answers[q.id]
            const border = a === 'evet' ? '#16a34a' : a === 'hayir' ? '#dc2626' : a === 'kismi' ? '#ca8a04' : '#e5e7eb'
            return (
              <div key={q.id} style={{ borderColor: border }}
                className="bg-white rounded-xl border-2 p-4 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 items-start flex-1">
                    <span className="text-xs text-gray-400 pt-0.5 font-mono">S{q.id}</span>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{q.text}</p>
                  </div>
                  <span className="ml-3 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{q.score}pt</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {[
                    ['evet',  '✓ Evet',  '#16a34a'],
                    ['kismi', '~ Kısmi', '#ca8a04'],
                    ['hayir', '✗ Hayır', '#dc2626'],
                    ['na',    'N/A',     '#6b7280'],
                  ].map(([val, label, color]) => (
                    <button key={val} onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                      style={a === val ? { background: color, color: '#fff', borderColor: color } : {}}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition
                        ${a === val ? '' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Gözlem notu (isteğe bağlı)..."
                  value={notes[q.id] || ''}
                  onChange={e => setNotes(p => ({ ...p, [q.id]: e.target.value }))}
                  className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-gray-50 focus:outline-none"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
