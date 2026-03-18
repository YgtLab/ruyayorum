# Deployment Guide

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
