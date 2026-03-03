export const QUESTIONS = [
  { id: 1,  category: "Hijyen & Sanitasyon",          text: "Çalışanlar gıda ile temas öncesi ellerini kurallara uygun yıkıyor mu?", score: 5 },
  { id: 2,  category: "Hijyen & Sanitasyon",          text: "Üretim alanlarında kişisel hijyen ekipmanları kullanılıyor mu?", score: 5 },
  { id: 3,  category: "Hijyen & Sanitasyon",          text: "Temizlik ve dezenfeksiyon programı yazılı olarak mevcut ve uygulanıyor mu?", score: 5 },
  { id: 4,  category: "Hijyen & Sanitasyon",          text: "Tuvalet ve lavabo tesisleri yeterli, temiz ve hijyenik mi?", score: 5 },
  { id: 5,  category: "Depolama & Muhafaza",          text: "Hammaddeler ve ürünler uygun sıcaklık koşullarında depolanıyor mu?", score: 5 },
  { id: 6,  category: "Depolama & Muhafaza",          text: "Son kullanma tarihi geçmiş ürünler için etkili bir kontrol sistemi var mı?", score: 5 },
  { id: 7,  category: "Depolama & Muhafaza",          text: "Gıda ve gıda dışı maddeler ayrı depolanıyor mu?", score: 5 },
  { id: 8,  category: "Ekipman & Altyapı",            text: "Ekipmanlar düzenli olarak temizleniyor ve bakımı yapılıyor mu?", score: 5 },
  { id: 9,  category: "Ekipman & Altyapı",            text: "Su kaynağı içme suyu standartlarını karşılıyor ve test ediliyor mu?", score: 5 },
  { id: 10, category: "Ekipman & Altyapı",            text: "Atık yönetim sistemi yeterli ve düzenli mi?", score: 5 },
  { id: 11, category: "HACCP & Dokümantasyon",        text: "HACCP planı mevcut, güncel ve etkin biçimde uygulanıyor mu?", score: 5 },
  { id: 12, category: "HACCP & Dokümantasyon",        text: "Kritik kontrol noktaları düzenli olarak izleniyor ve kayıt altına alınıyor mu?", score: 5 },
  { id: 13, category: "HACCP & Dokümantasyon",        text: "Düzeltici faaliyet prosedürleri yazılı ve uygulanıyor mu?", score: 5 },
  { id: 14, category: "HACCP & Dokümantasyon",        text: "Ürün geri çağırma prosedürü mevcut ve test edilmiş mi?", score: 5 },
  { id: 15, category: "Eğitim & Personel",            text: "Tüm personel gıda güvenliği konusunda eğitim almış mı? Kayıtlar mevcut mu?", score: 5 },
  { id: 16, category: "Eğitim & Personel",            text: "Yeni işe başlayan personele oryantasyon eğitimi verilmekte mi?", score: 5 },
  { id: 17, category: "Haşere Kontrolü",              text: "Haşere kontrol programı aktif, sözleşmeli ve kayıt altında mı?", score: 5 },
  { id: 18, category: "Haşere Kontrolü",              text: "Tesiste haşere girişini önleyici fiziksel bariyerler mevcut mu?", score: 5 },
  { id: 19, category: "Etiketleme & İzlenebilirlik",  text: "Ürünlerde lot numarası ve izlenebilirlik sistemi etkin biçimde kullanılıyor mu?", score: 5 },
  { id: 20, category: "Etiketleme & İzlenebilirlik",  text: "Etiketler mevzuata uygun, doğru ve eksiksiz bilgi içeriyor mu?", score: 5 },
]

export const RISK_LEVELS = [
  { min: 0,  max: 20,  key: "critical",  label: "KRİTİK RİSK", color: "#dc2626", bg: "#fef2f2",
    description: "Acil düzeltici faaliyet gereklidir. Tesis faaliyetleri risk altındadır." },
  { min: 21, max: 40,  key: "high",      label: "YÜKSEK RİSK", color: "#ea580c", bg: "#fff7ed",
    description: "Ciddi eksiklikler tespit edilmiştir. 30 gün içinde düzeltici faaliyet planı hazırlanmalıdır." },
  { min: 41, max: 60,  key: "medium",    label: "ORTA RİSK",   color: "#ca8a04", bg: "#fefce8",
    description: "Önemli eksiklikler mevcuttur. 60 gün içinde iyileştirme planı oluşturulmalıdır." },
  { min: 61, max: 80,  key: "low",       label: "DÜŞÜK RİSK",  color: "#2563eb", bg: "#eff6ff",
    description: "Genel uyum sağlanmıştır. 90 gün içinde iyileştirme yapılması tavsiye edilir." },
  { min: 81, max: 100, key: "compliant", label: "UYUMLU",       color: "#16a34a", bg: "#f0fdf4",
    description: "Gıda güvenliği gereksinimleri büyük ölçüde karşılanmaktadır." },
]

export function getRiskLevel(score: number, maxScore: number) {
  const pct = Math.round((score / maxScore) * 100)
  return RISK_LEVELS.find(r => pct >= r.min && pct <= r.max) || RISK_LEVELS[0]
}
