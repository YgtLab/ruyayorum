# Contributing Guide

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## Katkı Türleri
- Bug fix
- Yeni özellik
- Refactor
- Dokümantasyon
- Test iyileştirmesi

## Başlamadan Önce
1. Yeni bir issue aç veya mevcut issue'yu sahiplen.
2. Ayrı bir branch oluştur.
3. Değişiklikleri küçük ve odaklı tut.

## Lokal Kurulum
```bash
cp .env.example .env
npm install
npm run dev
```

## Kalite Kontrolleri
```bash
npm run lint
npm test
```
PR açmadan önce bu iki komutun başarılı olması beklenir.

## PR Kuralları
- PR açıklamasında neyi neden değiştirdiğini net yaz.
- Kırıcı değişiklik varsa özellikle belirt.
- UI değişikliği varsa ekran görüntüsü ekle.

## Commit Formatı
Önerilen prefixler:
- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## Contribution Types
- Bug fix
- Feature
- Refactor
- Documentation
- Test improvements

## Before You Start
1. Open a new issue or claim an existing one.
2. Create a dedicated branch.
3. Keep changes focused and small.

## Local Setup
```bash
cp .env.example .env
npm install
npm run dev
```

## Quality Checks
```bash
npm run lint
npm test
```
These two commands must pass before opening a PR.

## PR Rules
- Clearly explain what changed and why.
- Explicitly mention breaking changes.
- Add screenshots for UI changes.

## Commit Convention
Recommended prefixes:
- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`

</details>
