# API Reference (v1)

Base URL: `http://localhost:3000/api/v1`

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/2fa/setup-begin`
- `POST /auth/2fa/enable`
- `POST /auth/2fa/disable`
- `GET /auth/2fa/recovery-codes/status`
- `POST /auth/2fa/recovery-codes/regenerate`

## Yorum
- `GET /yorum/hak`
- `GET /yorum/istatistik`
- `POST /yorum`
- `GET /yorum/gecmis`
- `PATCH /yorum/:id/puan`
- `DELETE /yorum/:id`

## Destek
- `POST /support/tickets`
- `GET /support/tickets`
- `GET /support/tickets/:id`
- `POST /support/tickets/:id/reply`

## Admin
- `GET /admin/istatistik`
- `GET /admin/kullanicilar`
- `PUT /admin/kullanici/:id`
- `DELETE /admin/kullanici/:id`
- `GET /admin/kullanici/:id/detay`
- `GET /admin/audit`
- `GET /admin/tickets`
- `GET /admin/tickets/:id`
- `PATCH /admin/tickets/:id`
- `POST /admin/tickets/:id/reply`
- `GET /admin/tickets/stream` (SSE)

## Standart Hata Formatı
```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Açıklama"
  }
}
```

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/2fa/setup-begin`
- `POST /auth/2fa/enable`
- `POST /auth/2fa/disable`
- `GET /auth/2fa/recovery-codes/status`
- `POST /auth/2fa/recovery-codes/regenerate`

## Interpretation
- `GET /yorum/hak`
- `GET /yorum/istatistik`
- `POST /yorum`
- `GET /yorum/gecmis`
- `PATCH /yorum/:id/puan`
- `DELETE /yorum/:id`

## Support
- `POST /support/tickets`
- `GET /support/tickets`
- `GET /support/tickets/:id`
- `POST /support/tickets/:id/reply`

## Admin
- `GET /admin/istatistik`
- `GET /admin/kullanicilar`
- `PUT /admin/kullanici/:id`
- `DELETE /admin/kullanici/:id`
- `GET /admin/kullanici/:id/detay`
- `GET /admin/audit`
- `GET /admin/tickets`
- `GET /admin/tickets/:id`
- `PATCH /admin/tickets/:id`
- `POST /admin/tickets/:id/reply`
- `GET /admin/tickets/stream` (SSE)

## Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Description"
  }
}
```

</details>
