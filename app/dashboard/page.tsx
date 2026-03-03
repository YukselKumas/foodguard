'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ audits: 0, firms: 0, critical: 0, compliant: 0 })

  useEffect(() => {
    async function load() {
      const { data: audits } = await supabase.from('audits').select('risk_level')
      const { data: firms } = await supabase.from('companies').select('id')
      if (audits) {
        setStats({
          audits: audits.length,
          firms: firms?.length || 0,
          critical: audits.filter(a => a.risk_level === 'critical' || a.risk_level === 'high').length,
          compliant: audits.filter(a => a.risk_level === 'compliant').length,
        })
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Toplam Denetim',      val: stats.audits,    icon: '📋', color: 'blue'   },
    { label: 'Kayıtlı Firma',       val: stats.firms,     icon: '🏢', color: 'purple' },
    { label: 'Kritik / Yüksek Risk',val: stats.critical,  icon: '⚠️', color: 'red'    },
    { label: 'Uyumlu',              val: stats.compliant, icon: '✅', color: 'green'  },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Genel Bakış</h1>
      <p className="text-gray-500 text-sm mb-8">Gıda güvenliği denetim özeti</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-3">{c.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{c.val}</div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="flex gap-3">
          <Link href="/dashboard/audits/new"
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
            + Yeni Denetim Başlat
          </Link>
          <Link href="/dashboard/firms"
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            Firmaları Yönet
          </Link>
        </div>
      </div>
    </div>
  )
}
