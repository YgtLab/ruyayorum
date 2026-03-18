# Architecture

## Genel Akış

1. Frontend istekleri `fetch` ile `/api/v1/*` endpointlerine gider.
2. Express route katmanı validasyon ve auth middleware çalıştırır.
3. Servis katmanı iş kurallarını uygular.
4. Mongoose modelleri ile MongoDB işlem yapılır.
5. Gerekli durumlarda AI sağlayıcı, email ve queue katmanları kullanılır.

## Katmanlar

- `routes`: HTTP endpoint ve input doğrulama
- `middleware`: auth, error, validate, upload
- `services`: domain mantığı
- `models`: veri şemaları
- `utils`: token, email, ortak yardımcılar
- `lib`: Redis ve BullMQ gibi altyapı adaptörleri

## Güvenlik Prensipleri

- HttpOnly cookie ile token taşıma
- RBAC: user/admin ayrımı
- Request rate limiting
- Audit log ile kritik aksiyon izleme
- Soft delete stratejisi

## Ölçeklenebilirlik Notları

- Queue tabanlı email gönderimi
- Redis ile cache/rate-limit genişletme
- Prompt versioning ve model fallback
