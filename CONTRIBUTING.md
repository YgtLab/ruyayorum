# Contributing Guide / Katkı Rehberi

TR: Katkıların için teşekkürler.  
EN: Thanks for contributing.

## Contribution Types / Katkı Türleri

- Bug fix
- Feature
- Refactor
- Documentation
- Test improvements

## Before You Start / Başlamadan Önce

1. TR: Issue aç veya mevcut issue’yu sahiplen.  
   EN: Open an issue or claim an existing one.
2. TR: Yeni bir branch oluştur.  
   EN: Create a dedicated branch.
3. TR: Değişikliği küçük ve odaklı tut.  
   EN: Keep changes focused and small.

## Local Setup / Lokal Kurulum

```bash
cp .env.example .env
npm install
npm run dev
```

## Quality Checks / Kalite Kontrolleri

```bash
npm run lint
npm test
```

TR/EN: PR açmadan önce bu iki komutun başarılı olması beklenir.

## Pull Request Rules / PR Kuralları

- TR: PR açıklaması net olsun (ne değişti / neden).  
  EN: Keep PR description clear (what changed / why).
- TR: Kırıcı değişiklik varsa özellikle belirt.  
  EN: Explicitly mention breaking changes.
- TR: UI değişikliği varsa ekran görüntüsü ekle.  
  EN: Add screenshots for UI changes.

## Commit Convention

Preferred prefixes:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`
