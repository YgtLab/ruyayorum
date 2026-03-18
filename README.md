# RüyaYorum

Modern ve güvenli bir rüya yorum platformu.  
A modern and secure dream interpretation platform.

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## Genel Bakış
RüyaYorum; psikolojik ve dini yorum modları, kullanıcı hesabı, 2FA, admin paneli, destek talepleri ve PWA desteği sunar.

## Özellikler
- Psikolojik ve dini yorum modu
- Kayıt, giriş, email doğrulama, şifre sıfırlama
- 2FA + recovery code + session management
- Admin paneli ve audit log
- Ticket sistemi + dosya eki
- PWA (offline ekran dahil)

## Hızlı Başlangıç
```bash
git clone <repo-url>
cd ruyayorum
cp .env.example .env
npm install
npm run dev
```

Uygulama: `http://localhost:3000`

## Komutlar
- `npm run dev` - Geliştirme
- `npm start` - Production başlatma
- `npm run lint` - Syntax kontrolü
- `npm test` - Testler

## API Sürümleme
- Aktif: `/api/v1/*`
- Eski: `/api/auth/*`, `/api/yorum/*`, `/api/admin/*` (`410` döner)

## Ortam Değişkenleri
Tüm alanlar `.env.example` dosyasında açıklanmıştır.

## Güvenlik
Public yapmadan önce tüm gerçek anahtarları rotate et.

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## Overview
RüyaYorum provides psychological/religious interpretation modes, user accounts, 2FA, admin panel, support tickets, and PWA support.

## Features
- Psychological and religious interpretation modes
- Register, login, email verification, password reset
- 2FA + recovery codes + session management
- Admin panel and audit logging
- Ticketing system + file attachments
- PWA support (including offline screen)

## Quick Start
```bash
git clone <repo-url>
cd ruyayorum
cp .env.example .env
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Scripts
- `npm run dev` - Development mode
- `npm start` - Production start
- `npm run lint` - Syntax check
- `npm test` - Tests

## API Versioning
- Active: `/api/v1/*`
- Deprecated: `/api/auth/*`, `/api/yorum/*`, `/api/admin/*` (returns `410`)

## Environment Variables
All fields are documented in `.env.example`.

## Security
Rotate all real secrets before making the repository public.

</details>

## Documentation / Dokümantasyon
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API.md](docs/API.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License / Lisans
MIT - [LICENSE](LICENSE)
