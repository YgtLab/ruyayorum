# RüyaYorum

Türkiye odaklı, modern ve güvenli bir rüya yorum platformu.

RüyaYorum; psikolojik ve dini yorum modları, kullanıcı hesabı, 2FA, admin paneli, destek talepleri ve PWA desteği ile uçtan uca bir web ürün iskeleti sunar.

## Neden Bu Proje

- Gerçek ürün senaryosu ile backend + frontend birlikte geliştirme
- Güvenlik odaklı yaklaşım (JWT, HttpOnly cookie, rate limit, audit log)
- Ölçeklenebilir mimari (servis katmanı, queue, Redis entegrasyonu)
- Açık kaynak katkısına uygun düzenli repo yapısı

## Öne Çıkan Özellikler

- Rüya yorumu: psikolojik ve dini mod
- Kullanıcı sistemi: kayıt, giriş, email doğrulama, şifre sıfırlama
- Güvenlik: 2FA, recovery code, refresh session, brute-force koruması
- Yetkilendirme: admin paneli, kullanıcı ve plan yönetimi
- Destek sistemi: ticket oluşturma, dosya eki, admin yanıtı
- Yorum geçmişi: kullanıcı bazlı saklama, puanlama, silme
- PWA: manifest, service worker, çevrimdışı ekran
- Gözlemlenebilirlik: audit log ve temel istatistikler

## Teknoloji Yığını

- Backend: Node.js, Express
- Veritabanı: MongoDB (Mongoose)
- Kimlik doğrulama: JWT + HttpOnly Cookie
- Güvenlik: helmet, cors, express-rate-limit, bcryptjs
- AI: Groq API
- E-posta: Resend
- Queue: BullMQ
- Cache/infra: Redis (opsiyonel)
- Frontend: Vanilla JS + HTML + CSS

## Proje Yapısı

```text
.
├── frontend/                 # UI sayfaları ve istemci JS
│   ├── index.html
│   ├── auth.html
│   ├── profile.html
│   ├── admin.html
│   ├── support.html
│   ├── app.js
│   ├── auth.js
│   ├── profile.js
│   ├── admin.js
│   ├── support.js
│   ├── style.css
│   ├── sw.js
│   └── manifest.webmanifest
├── server/                   # API ve servis katmanı
│   ├── routes/v1/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── lib/
├── docs/                     # Mimari ve operasyon dökümanları
├── tests/                    # Jest testleri
├── .github/                  # CI, issue ve PR şablonları
└── server.js                 # Entry point
```

## Hızlı Başlangıç

1. Depoyu klonla

```bash
git clone <repo-url>
cd ruyayorum
```

2. Ortam değişkenlerini hazırla

```bash
cp .env.example .env
```

3. Bağımlılıkları kur

```bash
npm install
```

4. Geliştirme sunucusunu başlat

```bash
npm run dev
```

5. Tarayıcıdan aç

- `http://localhost:3000`

## Ortam Değişkenleri

Aşağıdaki alanlar `.env.example` dosyasında tanımlıdır:

- `NODE_ENV`: `development` veya `production`
- `PORT`: sunucu portu
- `ALLOWED_ORIGIN`: CORS izinli origin listesi
- `APP_URL`: email linklerinde kullanılacak base URL
- `MONGODB_URI`: MongoDB bağlantı adresi
- `JWT_SECRET`: JWT imzalama anahtarı
- `JWT_ACCESS_EXPIRE`: access token süresi
- `JWT_REFRESH_EXPIRE`: refresh token süresi
- `GROQ_API_KEY`: AI sağlayıcı anahtarı
- `RESEND_API_KEY`: email servis anahtarı
- `RESEND_FROM`: gönderen email adresi
- `ADMIN_EMAIL`: admin rolü verilecek email
- `REDIS_URL`: Redis bağlantısı (opsiyonel)
- `GENERAL_RATE_LIMIT_MAX`: genel istek limiti
- `AUTH_RATE_LIMIT_MAX`: auth istek limiti

## Komutlar

- `npm run dev`: geliştirme (nodemon)
- `npm start`: production başlatma
- `npm run lint`: JS syntax kontrolü
- `npm test`: testleri çalıştırır

## API Sürümleme

Aktif API sürümü:

- `/api/v1/*`

Eski endpointler:

- `/api/auth/*`
- `/api/yorum/*`
- `/api/admin/*`

Bu endpointler artık deprecated durumundadır ve `410` döner.

## Güvenlik Yaklaşımı

- HttpOnly cookie tabanlı token yönetimi
- Refresh session kaydı ve cihaz bazlı oturumlar
- Rate limit ve auth koruma katmanları
- Audit log ile yönetim işlemleri kayıt altına alma
- 2FA + tek kullanımlık recovery code desteği

Not: Proje public olmadan önce gerçek anahtarları rotate etmen önerilir.

## Kalite ve CI

- GitHub Actions ile CI
- Syntax check + test pipeline
- PR sürecinde standart şablonlar

## Yol Haritası

- Billing/abonelik altyapısı (gerçek ödeme)
- Gelişmiş gözlemleme (error tracking, merkezi log)
- E2E testler
- i18n ve çoklu dil
- Performans metrik panelleri

## Katkı

Katkı yönergeleri için:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
