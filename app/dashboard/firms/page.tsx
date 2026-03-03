'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Company = {
  id: string; name: string; tax_no: string; sector: string
  address: string; phone: string; email: string
  employee_count: number; certifications: string
}

export default function FirmsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', tax_no: '', sector: '', address: '',
    phone: '', email: '', employee_count: '', certifications: ''
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const sectors = [
    'Gıda Üretimi', 'Gıda Perakende', 'Restoran / Yemek Hizmetleri',
    'Gıda Depolama & Lojistik', 'Catering', 'Fırın & Pastane',
    'Et & Et Ürünleri', 'Süt & Süt Ürünleri', 'Deniz Ürünleri', 'Diğer'
  ]

  async function load() {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    if (data) setCompanies(data)
  }

  useEffect(() => { load() }, [])

  async function save() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single()
    const { error } = await supabase.from('companies').insert({
      ...form,
      employee_count: form.employee_count ? parseInt(form.employee_count) : null,
      tenant_id: userData?.tenant_id
    })
    if (error) { toast.error('Hata: ' + error.message); return }
    toast.success('Firma eklendi!')
    setShowForm(false)
    setForm({ name: '', tax_no: '', sector: '', address: '', phone: '', email: '', employee_count: '', certifications: '' })
    load()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmalar</h1>
          <p className="text-gray-500 text-sm mt-1">Denetlenecek firma kayıtları</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          + Yeni Firma Ekle
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Yeni Firma</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['name','Firma Adı *'],['tax_no','Vergi No *'],
                ['phone','Telefon'],['email','E-posta'],['employee_count','Çalışan Sayısı']
              ].map(([k, l]) => (
                <div key={k} className={k === 'name' ? 'col-span-2' : ''}>
                  <label className="text-xs font-bold text-gray-600 uppercase block mb-1">{l}</label>
                  <input value={(form as any)[k]} onChange={e => set(k, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Sektör</label>
                <select value={form.sector} onChange={e => set('sector', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                  <option value="">Seçiniz</option>
                  {sectors.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Adres</label>
                <input value={form.address} onChange={e => set('address', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Sertifikalar</label>
                <input value={form.certifications} onChange={e => set('certifications', e.target.value)}
                  placeholder="ISO 22000, BRC vb."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-semibold text-gray-600">İptal</button>
              <button onClick={save} disabled={!form.name || !form.tax_no}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-40">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Firma Adı','Vergi No','Sektör','Telefon','E-posta','İşlem'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.tax_no}</td>
                <td className="px-4 py-3 text-gray-500">{c.sector}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/audits/new?company=${c.id}`}
                    className="text-green-600 font-semibold hover:underline text-xs">
                    Denetim Başlat
                  </Link>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Henüz firma eklenmemiş</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
