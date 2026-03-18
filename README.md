# RüyaYorum / Dream Interpreter Platform

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![API Version](https://img.shields.io/badge/api-v1-blue)](docs/API.md)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-5A0FC8)](frontend/manifest.webmanifest)

Modern, secure, and production-oriented dream interpretation platform with bilingual UX (TR/EN), authentication, 2FA, admin tools, support tickets, and AI-powered interpretation workflows.

---

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## 1. Proje Özeti
RüyaYorum; kullanıcıların rüyalarını psikolojik veya dini modda yorumlayabildiği, güvenlik odaklı bir web platformudur. Sistem sadece bir arayüzden ibaret değil; backend servis katmanı, JWT tabanlı kimlik doğrulama, oturum yönetimi, admin paneli, denetim (audit) kayıtları, destek/ticket yönetimi ve altyapı ölçekleme hazırlıkları (Redis + Queue) ile gerçek ürün yaklaşımıyla tasarlanmıştır.

## 2. Temel Özellikler
- Psikolojik ve dini yorum modu
- Türkçe/İngilizce dil desteği (UI + backend hata metinleri)
- Üyelik sistemi (kayıt, giriş, email doğrulama, şifre sıfırlama)
- 2FA (TOTP) + recovery code
- Refresh token ve çoklu oturum yönetimi
- Kullanıcı profil ekranı ve güvenlik ayarları
- Geçmiş yorumlar, puanlama, görsel kart üretimi
- Admin paneli (istatistik, kullanıcı yönetimi, ticket yönetimi)
- Audit log (yönetim aksiyonlarının izlenmesi)
- Support/Ticket sistemi + dosya yükleme
- PWA (manifest, service worker, offline ekran)
- API v1 standardı ve merkezi hata formatı

## 3. Teknoloji Yığını
- **Frontend:** Vanilla HTML/CSS/JS + PWA
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, HttpOnly cookie, refresh session modeli
- **Security:** Helmet, CORS, rate limit, validation middleware
- **Email:** Resend
- **Queue/Cache:** BullMQ + Redis
- **Test:** Jest + Supertest

## 4. Mimari Yaklaşım
Ayrıntı: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Katmanlar:
- `server/routes/*`: HTTP endpoint katmanı
- `server/middleware/*`: auth, validate, error, upload
- `server/services/*`: iş kuralları (domain logic)
- `server/models/*`: Mongoose şemaları
- `server/utils/*`: ortak yardımcılar
- `server/lib/*`: altyapı adaptörleri (Redis, Queue)
- `frontend/*`: kullanıcı arayüzü

## 5. Klasör Yapısı
```text
ruyayorum/
├── frontend/
│   ├── index.html
│   ├── auth.html
│   ├── admin.html
│   ├── profile.html
│   ├── support.html
│   ├── app.js
│   ├── auth.js
│   ├── admin.js
│   ├── profile.js
│   ├── support.js
│   ├── i18n.js
│   ├── style.css
│   ├── sw.js
│   └── manifest.webmanifest
├── server/
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── lib/
├── docs/
├── tests/
├── .env.example
├── package.json
└── README.md
```

## 6. Hızlı Kurulum
```bash
git clone <repo-url>
cd ruyayorum
cp .env.example .env
npm install
npm run dev
```

Uygulama adresi: `http://localhost:3000`

## 7. Ortam Değişkenleri
Detaylı ve güncel örnek: [.env.example](.env.example)

Kritik alanlar:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `ALLOWED_ORIGIN`
- `APP_URL`
- `REDIS_URL`

## 8. Komutlar
```bash
npm run dev    # geliştirme
npm start      # production çalıştırma
npm run lint   # js syntax kontrol
npm test       # testler
```

## 9. API Referansı
Ayrıntı: [docs/API.md](docs/API.md)

Ana route grupları:
- `/api/v1/auth/*`
- `/api/v1/yorum/*`
- `/api/v1/support/*`
- `/api/v1/admin/*`

Health check:
- `GET /api/v1/health`

## 10. Güvenlik Yaklaşımı
- JWT + refresh token stratejisi
- HttpOnly cookie kullanımı
- Role-based authorization (user/admin)
- Route bazlı rate limiting
- Input validation (`express-validator`)
- Merkezi hata yönetimi
- Audit log ile kritik işlem kaydı

Detay: [SECURITY.md](SECURITY.md)

## 11. Dil (Localization)
Proje TR/EN desteklidir.
- Frontend metinleri: `frontend/i18n.js`
- Backend hata çevirileri: `server/utils/i18n.js`
- Dokümantasyon ve GitHub şablonları: çift dilli

Detay: [docs/LOCALIZATION.md](docs/LOCALIZATION.md)

## 12. PWA Desteği
- Service worker: `frontend/sw.js`
- Manifest: `frontend/manifest.webmanifest`
- Offline ekran: `frontend/offline.html`

## 13. Test Stratejisi
- Unit/integration testler: `tests/*`
- Auth token yardımcıları testlenir
- Prompt üretimi testlenir

## 14. Deployment
Ayrıntılı adımlar: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Önerilen süreç:
1. Lint + test
2. Staging deploy
3. Smoke test
4. Production deploy
5. Health kontrol

## 15. Katkı ve Topluluk
- Katkı rehberi: [CONTRIBUTING.md](CONTRIBUTING.md)
- Davranış kuralları: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Güvenlik bildirimi: [SECURITY.md](SECURITY.md)

## 16. Sık Karşılaşılan Sorunlar
- **Port açılmıyor:** `.env` ve `PORT` değerini kontrol et
- **Mongo bağlanmıyor:** IP whitelist, kullanıcı/şifre, URI formatını doğrula
- **CORS hatası:** `ALLOWED_ORIGIN` frontend origin ile birebir eşleşmeli
- **Email gitmiyor:** `RESEND_API_KEY` ve sender domain doğrulamasını kontrol et
- **Admin panel boş:** `ADMIN_EMAIL` doğru kullanıcı ile aynı olmalı

## 17. Yasal Not
Platformdaki AI çıktıları bilgilendirme/eğlence amaçlıdır; dini fetva, tıbbi, hukuki veya kesin psikolojik teşhis yerine geçmez.

## 18. Lisans
MIT — [LICENSE](LICENSE)

</details>

---

<details>
<summary><strong>🇬🇧 English</strong></summary>

## 1. Project Overview
RüyaYorum is a security-focused dream interpretation platform where users can request psychological or religious interpretations. It is designed as a real product architecture (not just a UI), including service-oriented backend, JWT auth, session management, admin panel, audit logs, support/ticket workflows, and scaling-ready infra patterns (Redis + queue).

## 2. Core Features
- Psychological and religious interpretation modes
- Bilingual support (Turkish/English) for UI + backend errors
- User accounts (register, login, email verification, password reset)
- 2FA (TOTP) + recovery codes
- Refresh token and multi-session management
- Profile and account security settings
- Interpretation history, rating, visual card generation
- Admin panel (stats, user management, ticket operations)
- Audit log for admin-critical actions
- Support/Ticket system + attachment upload
- PWA support (manifest, service worker, offline page)
- API v1 standard and unified error responses

## 3. Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS + PWA
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, HttpOnly cookies, refresh session model
- **Security:** Helmet, CORS, rate limiting, input validation
- **Email:** Resend
- **Queue/Cache:** BullMQ + Redis
- **Testing:** Jest + Supertest

## 4. Architecture
See full details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Layers:
- `server/routes/*`: HTTP endpoints
- `server/middleware/*`: auth, validate, error, upload
- `server/services/*`: business/domain logic
- `server/models/*`: Mongoose schemas
- `server/utils/*`: shared utilities
- `server/lib/*`: infrastructure adapters (Redis, queue)
- `frontend/*`: user-facing application

## 5. Project Structure
```text
ruyayorum/
├── frontend/
├── server/
├── docs/
├── tests/
├── .env.example
├── package.json
└── README.md
```

## 6. Quick Start
```bash
git clone <repo-url>
cd ruyayorum
cp .env.example .env
npm install
npm run dev
```

App URL: `http://localhost:3000`

## 7. Environment Variables
Up-to-date example: [.env.example](.env.example)

Critical variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `ALLOWED_ORIGIN`
- `APP_URL`
- `REDIS_URL`

## 8. Scripts
```bash
npm run dev    # development
npm start      # production start
npm run lint   # JS syntax check
npm test       # test suites
```

## 9. API Reference
Detailed documentation: [docs/API.md](docs/API.md)

Main route groups:
- `/api/v1/auth/*`
- `/api/v1/yorum/*`
- `/api/v1/support/*`
- `/api/v1/admin/*`

Health check:
- `GET /api/v1/health`

## 10. Security Model
- JWT + refresh token strategy
- HttpOnly cookie usage
- Role-based authorization (user/admin)
- Route-level rate limiting
- Request validation (`express-validator`)
- Centralized error handling
- Audit logs for critical operations

Read: [SECURITY.md](SECURITY.md)

## 11. Localization
The project supports Turkish and English.
- Frontend strings: `frontend/i18n.js`
- Backend error translation: `server/utils/i18n.js`
- Docs and GitHub templates: bilingual

Read: [docs/LOCALIZATION.md](docs/LOCALIZATION.md)

## 12. PWA
- Service worker: `frontend/sw.js`
- Manifest: `frontend/manifest.webmanifest`
- Offline page: `frontend/offline.html`

## 13. Testing Strategy
- Unit/integration tests under `tests/*`
- Auth token utility tests
- Prompt generation tests

## 14. Deployment
Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Recommended flow:
1. Lint + tests
2. Staging deployment
3. Smoke tests
4. Production deployment
5. Health checks

## 15. Contributing and Community
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](SECURITY.md)

## 16. Common Issues
- **App not opening:** check `.env` and `PORT`
- **MongoDB errors:** verify IP whitelist, credentials, URI format
- **CORS issues:** ensure `ALLOWED_ORIGIN` exactly matches frontend origin
- **Email not sending:** verify `RESEND_API_KEY` and sender/domain status
- **Admin panel empty:** ensure your account email matches `ADMIN_EMAIL`

## 17. Legal Notice
AI-generated interpretations are for informational/entertainment purposes and do not replace professional religious, medical, legal, or psychological advice.

## 18. License
MIT — [LICENSE](LICENSE)

</details>

---

## Related Docs / İlgili Dokümanlar
- [docs/API.md](docs/API.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/LOCALIZATION.md](docs/LOCALIZATION.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
