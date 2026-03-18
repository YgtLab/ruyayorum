# Contributing Guide

RüyaYorum'a katkı vermek istediğin için teşekkürler.

## Katkı Türleri

- Bug düzeltme
- Yeni özellik
- Refactor
- Dokümantasyon iyileştirmesi
- Test kapsamı artırma

## Başlamadan Önce

1. Issue aç veya mevcut issue altında çalışacağını belirt
2. Yeni bir branch oluştur
3. Değişikliği küçük ve odaklı tut

## Lokal Kurulum

```bash
cp .env.example .env
npm install
npm run dev
```

## Kod Standartları

- Değişiklikler mevcut mimari ve isimlendirme ile tutarlı olmalı
- Geriye dönük kırılma yaratacak değişikliklerde migration notu eklenmeli
- Güvenlik etkisi olan değişikliklerde risk notu bırakılmalı

## PR Süreci

1. PR başlığını net yaz
2. Ne değişti / neden değişti kısa özetle
3. Test adımlarını belirt
4. UI değişikliği varsa ekran görüntüsü ekle

PR merge öncesi beklenenler:

- `npm run lint` başarılı
- `npm test` başarılı
- CI yeşil

## Commit Önerisi

Conventional Commits tercih edilir:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`

Örnek:

```text
feat(auth): add recovery code regeneration endpoint
```
