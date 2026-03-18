# RüyaYorum

TR: Modern ve güvenli bir rüya yorum platformu.  
EN: A modern and secure dream interpretation platform.

## Overview / Genel Bakış

TR: RüyaYorum; psikolojik ve dini yorum modları, kullanıcı hesabı, 2FA, admin paneli, destek talepleri ve PWA desteği sunar.  
EN: RüyaYorum provides psychological/religious interpretation modes, user accounts, 2FA, admin panel, support tickets, and PWA support.

## Features / Özellikler

- TR: Psikolojik ve dini yorum modu | EN: Psychological and religious interpretation modes
- TR: Kayıt, giriş, email doğrulama, şifre sıfırlama | EN: Register, login, email verification, password reset
- TR: 2FA + recovery code + session management | EN: 2FA + recovery codes + session management
- TR: Admin paneli ve audit log | EN: Admin panel and audit logging
- TR: Ticket sistemi + dosya eki | EN: Ticketing system + file attachments
- TR: PWA (offline ekran dahil) | EN: PWA (including offline screen)

## Quick Start / Hızlı Başlangıç

```bash
git clone <repo-url>
cd ruyayorum
cp .env.example .env
npm install
npm run dev
```

- TR: Uygulama: `http://localhost:3000`
- EN: App URL: `http://localhost:3000`

## Scripts / Komutlar

- `npm run dev` - TR: Geliştirme | EN: Development mode
- `npm start` - TR: Production başlatma | EN: Production start
- `npm run lint` - TR: Syntax kontrolü | EN: Syntax check
- `npm test` - TR: Testler | EN: Tests

## API Versioning / API Sürümleme

- Active/Aktif: `/api/v1/*`
- Deprecated/Eski: `/api/auth/*`, `/api/yorum/*`, `/api/admin/*` (returns `410`)

## Environment Variables / Ortam Değişkenleri

TR/EN: Tüm alanlar `.env.example` dosyasında açıklanmıştır.

## Security / Güvenlik

TR: Public yapmadan önce tüm gerçek anahtarları rotate et.  
EN: Rotate all real secrets before making the repository public.

## Documentation / Dokümantasyon

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API.md](docs/API.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License / Lisans

MIT - [LICENSE](LICENSE)
