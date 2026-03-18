# Deployment Guide

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## Production Öncesi
1. Tüm secret değerleri rotate et
2. `NODE_ENV=production` ayarla
3. `ALLOWED_ORIGIN` ve `APP_URL` değerlerini canlı domaine göre güncelle
4. MongoDB ve Resend prod yapılandırmasını doğrula
5. HTTPS zorunlu ortamda cookie davranışını test et

## Önerilen Akış
1. CI geçer (`lint`, `test`)
2. Staging deploy
3. Smoke test
4. Production deploy
5. Health check (`/api/v1/health`)

## Geri Dönüş Planı
- Son çalışan release tag ile geri dönüş
- DB migration varsa geri dönüş notları
- Incident sonrası postmortem

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## Before Production
1. Rotate all secret values
2. Set `NODE_ENV=production`
3. Update `ALLOWED_ORIGIN` and `APP_URL` for the live domain
4. Verify MongoDB and Resend production configuration
5. Test cookie behavior under mandatory HTTPS

## Recommended Flow
1. CI passes (`lint`, `test`)
2. Deploy to staging
3. Run smoke tests
4. Deploy to production
5. Run health check (`/api/v1/health`)

## Rollback Plan
- Roll back to the last known good release tag
- Include rollback notes if DB migrations exist
- Run a postmortem after incidents

</details>
