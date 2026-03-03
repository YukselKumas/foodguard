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

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([])

  useEffect(() => {
    supabase.from('audits')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setAudits(data))
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denetimler</h1>
          <p className="text-gray-500 text-sm mt-1">Tüm denetim kayıtları</p>
        </div>
        <Link href="/dashboard/audits/new"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          + Yeni Denetim
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Firma', 'Tarih', 'Puan', 'Risk Seviyesi', 'Durum', 'İşlem'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {audits.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{a.companies?.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.audit_date}</td>
                <td className="px-4 py-3 font-bold text-green-700">{a.total_score}/{a.max_score}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${RISK_COLORS[a.risk_level] || 'bg-gray-100 text-gray-600'}`}>
                    {RISK_LABELS[a.risk_level] || a.risk_level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {a.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/audits/${a.id}`}
                    className="text-green-600 font-semibold hover:underline text-xs">
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Henüz denetim yapılmamış</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
