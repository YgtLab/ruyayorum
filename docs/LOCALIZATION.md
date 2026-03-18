# Localization / Yerelleştirme

<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>

## Amaç
Bu doküman, projenin çok dilli (TR/EN) yapısını ve katkı kurallarını açıklar.

## Kapsam
- Frontend sayfaları: `frontend/i18n.js` ile TR/EN
- API hata/mesaj metinleri: `server/utils/i18n.js`
- Dokümantasyon: Markdown dosyalarında TR/EN bölümler
- GitHub şablonları: Issue/PR template'lerinde TR/EN metinler

## Yeni Metin Eklerken
1. Frontend kullanıcı metniyse `trEn(...)` veya `i18n.js` eşlemesine ekle.
2. Backend hata mesajıysa `server/utils/i18n.js` sözlüğüne ekle.
3. Dokümantasyon güncellemesinde TR/EN karşılığını birlikte yaz.
4. Mümkünse anahtar bazlı metin yaklaşımı kullan.

## Kontrol Listesi
- [ ] TR metin eklendiyse EN karşılığı var
- [ ] EN modunda kritik akışlar (auth, yorum, admin) test edildi
- [ ] Legal sayfalar EN modunda doğru çevriliyor

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

## Purpose
This document describes the project's multilingual (TR/EN) structure and contribution rules.

## Scope
- Frontend pages: TR/EN via `frontend/i18n.js`
- API errors/messages: `server/utils/i18n.js`
- Documentation: TR/EN sections in Markdown files
- GitHub templates: TR/EN text in issue/PR templates

## When Adding New Text
1. For frontend UI text, use `trEn(...)` or add mapping in `i18n.js`.
2. For backend errors, add dictionary entries in `server/utils/i18n.js`.
3. For docs updates, always include both TR and EN.
4. Prefer key-based text management where possible.

## Checklist
- [ ] Every new TR string has an EN counterpart
- [ ] Critical flows tested in EN mode (auth, interpretation, admin)
- [ ] Legal pages render correctly in EN mode

</details>
