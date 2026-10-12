# Site translations

The site is available in English (default, repo root), Italian (`/it/`), Spanish (`/es/`), Japanese (`/ja/`) and German (`/de/`).

**The English pages in the repo root are the only source.** `it/`, `es/`, `ja/`, `de/` and `js/i18n/*.js` are generated: never edit them by hand.

## After changing any text on an English page

```bash
python tools/i18n/build.py --catalog   # lists every English string in tools/i18n/catalog.json
python tools/i18n/build.py             # rebuilds all languages, the sitemap and js/i18n/*.js
```

The build prints, per language, how many strings are missing from `tools/i18n/lang/<code>.json`. A missing string
is shown in English until it is translated, so nothing breaks. To translate it, add the English text as a key in
`lang/<code>.json` (under `"html"`, or under `"js"` for texts created by scripts) with the translation as value.

Rules for translations:

* keys are the English text exactly as in `catalog.json` (inline HTML included, e.g. `Explore <span class="arr">↗</span>`);
* keep the same tags and attributes in the translation, only the words change (strings with different tags are ignored and reported);
* brand, tier and technology names stay as they are.

## How language selection works

* Every English page has a small script in `<head>` (generated, between `<!--lang:head-->` markers). On a first visit it reads
  `navigator.languages`, takes the first supported language (en, it, es, ja, de) and moves the visitor to that version.
  Unknown languages stay on English.
* The language switcher (navbar, mobile menu, footer) is a set of plain links. Clicking one stores the choice in
  `localStorage` (`hx-lang`) and from then on that choice wins over the browser language.
* Localized pages never redirect: the URL always decides.
* `hreflang` tags and `sitemap.xml` list all five versions.

## Adding a language

Add the code to `LANGS`, `NAMES` and `LOCALES` in `build.py`, create `lang/<code>.json`, then run the build.
