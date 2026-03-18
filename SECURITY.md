# Security Policy

## Supported Branch

- `main`

## Güvenlik Açığı Bildirimi

Public issue açmadan özel bildirim yap:

- `iletisim@ruyayorum.app`

Raporunda şu bilgileri paylaş:

1. Etkilenen endpoint veya ekran
2. Yeniden üretim adımları
3. Beklenen davranış ve gerçekleşen davranış
4. Olası etki seviyesi

## Yanıt SLA (Hedef)

- İlk geri dönüş: 72 saat
- Kritik açık değerlendirmesi: 7 gün içinde

## Sorumlu Açıklama

- Açık doğrulanmadan public paylaşım yapılmamalı
- Düzeltme yayınlandıktan sonra sorumlu açıklama teşvik edilir

## Güvenlik Notları

- Public repo öncesi tüm secret değerleri rotate edilmelidir
- `.env` dosyası asla repoya eklenmemelidir
- Şüpheli login ve kimlik doğrulama olayları audit log ile izlenir
