'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else setUser(data.session.user)
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav = [
    { href: '/dashboard', label: 'Genel Bakış', icon: '📊' },
    { href: '/dashboard/firms', label: 'Firmalar', icon: '🏢' },
    { href: '/dashboard/audits', label: 'Denetimler', icon: '📋' },
    { href: '/dashboard/reports', label: 'Raporlar', icon: '📄' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-500 rounded-lg flex items-center justify-center text-sm">🛡️</div>
            <div>
              <div className="font-bold text-green-900 text-sm">FoodGuard</div>
              <div className="text-xs text-gray-400">Denetim Sistemi</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition font-medium
                ${pathname === item.href
                  ? 'bg-green-50 text-green-700 border-l-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="text-xs text-gray-400 truncate mb-2">{user?.email}</div>
          <button onClick={signOut}
            className="w-full text-xs text-red-500 hover:text-red-700 py-1.5 rounded text-left px-2 hover:bg-red-50">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
