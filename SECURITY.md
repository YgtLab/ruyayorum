# Security Policy / Güvenlik Politikası

## Supported Branch / Desteklenen Dal

- `main`

## Reporting a Vulnerability / Açık Bildirimi

TR: Public issue açmadan önce özel bildirim yap.  
EN: Please report vulnerabilities privately before opening a public issue.

- Contact/İletişim: `iletisim@ruyayorum.app`

Include / Rapora ekleyin:

1. Affected endpoint/page (Etkilenen endpoint/ekran)
2. Reproduction steps (Yeniden üretim adımları)
3. Expected vs actual behavior (Beklenen/gerçek davranış)
4. Impact level (Etki seviyesi)

## Response Targets / Yanıt Hedefleri

- First response / İlk geri dönüş: 72 hours
- Critical triage / Kritik değerlendirme: 7 days

## Responsible Disclosure / Sorumlu Açıklama

TR: Açık doğrulanmadan public paylaşım yapılmamalı.  
EN: Do not publicly disclose before validation and fix.

## Security Notes / Güvenlik Notları

- Rotate all secrets before public release.
- Never commit `.env`.
- Audit logs are used for sensitive account/admin actions.
