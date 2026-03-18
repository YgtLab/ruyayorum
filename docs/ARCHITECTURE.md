# Architecture

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

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

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## General Flow
1. Frontend sends requests to `/api/v1/*` using `fetch`.
2. Express route layer handles validation and auth middleware.
3. Service layer applies business rules.
4. MongoDB operations are handled via Mongoose models.
5. AI provider, email, and queue layers are used where needed.

## Layers
- `routes`: HTTP endpoints and input validation
- `middleware`: auth, error, validate, upload
- `services`: domain/business logic
- `models`: data schemas
- `utils`: token, email, shared helpers
- `lib`: infrastructure adapters such as Redis and BullMQ

## Security Principles
- HttpOnly cookies for token transport
- RBAC: user/admin separation
- Request rate limiting
- Audit logging for critical actions
- Soft-delete strategy

## Scalability Notes
- Queue-based email delivery
- Redis for cache/rate-limit scaling
- Prompt versioning and model fallback

</details>
