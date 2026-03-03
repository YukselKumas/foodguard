'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
  compliant: 'bg-green-100 text-green-700',
}
const RISK_LABELS: Record<string, string> = {
  critical: 'Kritik Risk', high: 'Yüksek Risk',
  medium: 'Orta Risk', low: 'Düşük Risk', compliant: 'Uyumlu'
}

export default function ReportsPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('audits')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setAudits(data))
  }, [])

  const filtered = filter === 'all' ? audits : audits.filter(a => a.risk_level === filter)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <p className="text-gray-500 text-sm mt-1">Tüm denetim raporlarına buradan ulaşabilirsiniz</p>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        {[
          ['all', 'Tümü'],
          ['critical', 'Kritik'],
          ['high', 'Yüksek Risk'],
          ['medium', 'Orta Risk'],
          ['low', 'Düşük Risk'],
          ['compliant', 'Uyumlu'],
        ].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition
              ${filter === val ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(a => {
          const pct = Math.round((a.total_score / a.max_score) * 100)
          return (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center hover:shadow-sm transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl">📋</div>
                <div>
                  <div className="font-bold text-gray-900">{a.companies?.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{a.audit_date}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-green-700">{a.total_score}</div>
                  <div className="text-xs text-gray-400">/ {a.max_score} puan</div>
                </div>
                <div className="w-20">
                  <div className="text-xs text-gray-400 mb-1 text-center">%{pct}</div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-green-500 rounded-full"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${RISK_COLORS[a.risk_level] || 'bg-gray-100 text-gray-600'}`}>
                  {RISK_LABELS[a.risk_level] || a.risk_level}
                </span>
                <Link href={`/dashboard/audits/${a.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition">
                  Raporu Gör
                </Link>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            Bu filtreye uygun rapor bulunamadı
          </div>
        )}
      </div>
    </div>
  )
}
