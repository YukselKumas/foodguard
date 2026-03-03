'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')

  async function handleSubmit() {
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-500 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <div className="font-bold text-green-900 text-lg">FoodGuard</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Denetim Sistemi</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Gıda güvenliği denetim platformuna hoşgeldiniz.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
              placeholder="ornek@sirket.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? 'Hesabın yok mu?' : 'Hesabın var mı?'}{' '}
          <button
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            className="text-green-600 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  )
}
