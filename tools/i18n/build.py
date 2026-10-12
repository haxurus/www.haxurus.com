#!/usr/bin/env python3
"""Build the localized copies of the site.

The English pages in the repo root are the source of truth. This script reads them, replaces every piece of
visible text with its translation from tools/i18n/lang/<code>.json, and writes it/, es/, ja/ and de/ next to
the English pages, plus the language switcher data, hreflang tags, sitemap and the per-language JS dictionaries.

    python tools/i18n/build.py            # build every language
    python tools/i18n/build.py --catalog  # (re)write tools/i18n/catalog.json with all English strings
    python tools/i18n/build.py --check    # list strings that are missing from a language file

Strings are keyed by their English text (inner HTML for text with inline tags). A key missing from a language
file simply stays in English, so the site never breaks while translations are being added.
"""
import json
import os
import re
import sys
from urllib.parse import quote, unquote, urlsplit

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import htmltree as H  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LANG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lang')
SITE = 'https://haxurus.com'

LANGS = ['en', 'it', 'es', 'ja', 'de']
NAMES = {'en': 'English', 'it': 'Italiano', 'es': 'Español', 'ja': '日本語', 'de': 'Deutsch'}
LOCALES = {'en': 'en_US', 'it': 'it_IT', 'es': 'es_ES', 'ja': 'ja_JP', 'de': 'de_DE'}
PAGES = ['', 'support/', 'commissions/', 'vrchat/', 'helixhorizon/']          # directory of each page, '' = home

# Names that are never translated. A string made only of these (and digits/symbols) is left alone.
KEEP = [
    'Haxurus', 'HAXURUS', '@Haxurus', 'VRChat', 'Discord', 'Telegram', 'Instagram', 'GitHub', 'Spotify', 'Steam', 'Patreon',
    'ChatGPT', 'OpenAI', 'Claude', 'Anthropic', 'WordPress', 'E-mail', 'Ctrl K', 'Esc', 'Enter', 'Helix Horizon',
    'Spirit Supporter', 'Rookie Adventurer', 'Main Character', 'Sensei', 'Final Boss',
]

INLINE = {'a', 'abbr', 'b', 'bdi', 'br', 'button', 'cite', 'code', 'em', 'i', 'img', 'kbd', 'mark', 'q', 's', 'small',
          'span', 'strong', 'sub', 'sup', 'svg', 'time', 'u', 'wbr'}
SKIP_TAGS = {'script', 'style', 'svg', 'noscript', 'code', 'pre', 'template'}
ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'data-tip', 'data-s')
META_KEYS = {'description', 'twitter:title', 'twitter:description', 'og:title', 'og:description', 'og:image:alt'}
ASSET_EXT = re.compile(r'\.(css|js|webp|png|jpe?g|gif|svg|ico|avif|woff2?|mp4|webm|json|txt|xml|webmanifest)([?#].*)?$', re.I)
URL_ATTRS = ('href', 'src', 'data-peek', 'data-cover', 'poster')

LETTER = re.compile(r'[^\W\d_]', re.U)


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def plain(s):
    return re.sub(r'<[^>]+>', ' ', s)


def translatable(text):
    """True when `text` still has letters once tags and the KEEP names are removed."""
    t = plain(text)
    for k in sorted(KEEP, key=len, reverse=True):
        t = re.sub(re.escape(k), ' ', t, flags=re.I)
    t = re.sub(r'&[#\w]+;', ' ', t)
    return bool(LETTER.search(t))


# ---------------------------------------------------------------------------------------------------------------
# Walking a page
# ---------------------------------------------------------------------------------------------------------------
class Walker:
    """Visits every translatable piece of a page. `tr(key)` returns the translation or None (keep as is)."""

    def __init__(self, tr, warn):
        self.tr = tr
        self.warn = warn

    def run(self, root):
        self.walk(root)
        for el in root.find_all('meta'):
            key = el.get('name') or el.get('property')
            if key in META_KEYS and el.get('content') and translatable(el.get('content')):
                t = self.tr(norm(el.get('content')))
                if t is not None:
                    el.set('content', t)
        for el in root.find_all('script'):
            kind = el.get('type')
            if kind == 'application/ld+json':
                self.json_script(el, ('description', 'name'))
            elif el.get('id') == 'pal-extra':
                self.json_script(el, ('t', 's'))
        for el in root.find_all('a'):
            href = el.get('href') or ''
            if href.startswith('mailto:') and 'subject=' in href:
                m = re.search(r'subject=([^&]*)', href)
                subj = unquote(m.group(1))
                t = self.tr(norm(subj)) if translatable(subj) else None
                if t is not None:
                    el.set('href', href[:m.start(1)] + quote(t, safe='') + href[m.end(1):])

    # JSON blocks ---------------------------------------------------------
    def json_script(self, el, keys):
        raw = ''.join(c.raw for c in el.children if isinstance(c, H.Text))
        try:
            data = json.loads(raw)
        except ValueError:
            return

        def go(o):
            if isinstance(o, dict):
                for k, v in list(o.items()):
                    if k in keys and isinstance(v, str) and translatable(v):
                        t = self.tr(norm(v))
                        if t is not None:
                            o[k] = plain_text(t)
                    else:
                        go(v)
            elif isinstance(o, list):
                for v in o:
                    go(v)
        go(data)
        indent = 2 if '\n' in raw.strip()[:40] else None
        el.children = [H.Text('\n' + json.dumps(data, ensure_ascii=False, indent=indent, separators=None if indent else (',', ':')) + '\n')]

    # Elements ------------------------------------------------------------
    def walk(self, node):
        for el in list(node.children):
            if not isinstance(el, H.Element):
                continue
            if el.tag in SKIP_TAGS or el.get('translate') == 'no' or el.get('id') == 'boot':
                continue
            if self.special(el):
                continue
            self.attrs(el)
            if self.is_unit(el):
                self.unit_inner(el)
                continue
            self.walk(el)

    def attrs(self, el):
        for a in ATTRS:
            v = el.get(a)
            if v and translatable(v):
                if a == 'aria-label' and (el.find('span', **{'class': 'ltr'}) or any('ltr' in c.classes() for c in el.elements())):
                    continue
                t = self.tr(norm(v))
                if t is not None:
                    el.set(a, plain_text(t))
        v = el.get('data-tags')
        if v:
            out = []
            for tag in v.split('|'):
                t = self.tr(norm(tag)) if translatable(tag) else None
                out.append(plain_text(t) if t is not None else tag)
            el.set('data-tags', '|'.join(out))

    def is_unit(self, el):
        direct = [c for c in el.children if isinstance(c, H.Text) and LETTER.search(re.sub(r'&[#\w]+;', '', c.raw))]
        if not direct:
            return False
        for c in el.elements():
            if c.tag not in INLINE:
                self.warn('text mixed with block child in <%s class="%s">: %s' % (el.tag, el.get('class'), norm(el.inner())[:80]))
                return False
        return True

    def unit_inner(self, el):
        opaque = {'svg': [], 'img': []}

        def ser(n):
            if isinstance(n, H.Element) and n.tag in opaque:
                opaque[n.tag].append(H.serialize(n))
                return '<%s/>' % n.tag
            if isinstance(n, H.Element) and n.children:
                return '<%s%s>%s</%s>' % (n.tag, ''.join(' %s="%s"' % (k, H.esc_attr(v)) if v is not None else ' ' + k for k, v in n.attrs),
                                         ''.join(ser(c) for c in n.children), n.tag)
            return H.serialize(n)
        key = norm(''.join(ser(c) for c in el.children))
        if not translatable(key):
            return
        t = self.tr(key)
        if t is not None:
            for tag, items in opaque.items():
                it = iter(items)
                t = re.sub('<%s/>' % tag, lambda m: next(it, ''), t)
            el.set_inner(t)
            if el.get('data-t') is not None:
                el.set('data-t', plain_text(t))

    # Headings that are split into masked words / letters ------------------
    def special(self, el):
        kids = el.elements()
        # <h2><span class="mask"><span style="--d:0">Word</span></span> ...</h2>
        if kids and all(k.tag == 'span' and 'mask' in k.classes() for k in kids):
            words = [norm(plain(k.inner())) for k in kids]
            key = ' '.join(words)
            if translatable(key):
                t = self.tr(key)
                if t is not None:
                    el.children = []
                    for i, w in enumerate(t.split()):
                        if i:
                            el.append(H.Text(' '))
                        el.append(H.parse('<span class="mask"><span style="--d:%d">%s</span></span>' % (i, w)).children[0])
            return True
        label = el.get('aria-label')
        # Support-page title: <span class="w"><span class="ltr" style="--i:n">c</span>...</span>
        if label and kids and all(k.tag == 'span' and 'w' in k.classes() for k in kids) and any(k.find('span', **{'class': 'ltr'}) for k in kids):
            if translatable(label):
                t = self.tr(norm(label))
                if t is not None:
                    el.set('aria-label', t)
                    el.children = []
                    n = 0
                    for wi, w in enumerate(t.split()):
                        if wi:
                            el.append(H.Text(' '))
                        letters = ''.join('<span class="ltr" style="--i:%d" aria-hidden="true">%s</span>' % (n + j, c) for j, c in enumerate(w))
                        n += len(w)
                        el.append(H.parse('<span class="w">%s</span>' % letters).children[0])
            return True
        # Hero name: letters directly inside the heading
        if label and kids and all('ltr' in k.classes() for k in kids):
            return True
        # Commissions title: <span><b><i style="--k:n">c</i>...</b></span> per line
        if label and 'cx-title' in el.classes():
            if translatable(label):
                t = self.tr(norm(label))
                if t is not None:
                    el.set('aria-label', t)
                    el.children = []
                    n = 0
                    for w in t.split():
                        letters = ''.join('<i style="--k:%d">%s</i>' % (n + j, c) for j, c in enumerate(w))
                        n += len(w)
                        el.append(H.parse('<span><b>%s</b></span>' % letters).children[0])
            return True
        return False


def plain_text(s):
    """Translation text that goes into an attribute / JSON value: no tags, unescaped entities."""
    s = re.sub(r'<[^>]+>', '', s)
    return s.replace('&amp;', '&').replace('&quot;', '"').replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>')


# ---------------------------------------------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------------------------------------------
def read_page(rel):
    path = os.path.join(ROOT, rel, 'index.html')
    with open(path, encoding='utf-8') as f:
        return H.parse(f.read())


def collect():
    """All English strings in order of first appearance, with the pages they occur on."""
    seen, warns = {}, []

    def tr_for(page):
        def tr(key):
            seen.setdefault(key, [])
            if page not in seen[key]:
                seen[key].append(page)
            return None
        return tr
    for rel in PAGES:
        Walker(tr_for(rel or 'home'), lambda m, r=rel: warns.append('%s: %s' % (r or 'home', m))).run(read_page(rel))
    return seen, warns


def js_strings():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'js_strings.json')
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def write_catalog():
    seen, warns = collect()
    js = js_strings()
    cat = {'_note': 'English source strings. Copy this file to lang/<code>.json and translate the values.',
           'html': {k: '' for k in list(seen) + [e for e in EXTRA if e not in seen]}, 'js': {k: '' for k in js}}
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog.json'), 'w', encoding='utf-8') as f:
        json.dump(cat, f, ensure_ascii=False, indent=1)
    print('catalog: %d html strings, %d js strings' % (len(seen), len(js)))
    for w in warns:
        print('WARN', w)


# ---------------------------------------------------------------------------------------------------------------
# Generated blocks (language switcher, hreflang, redirect)
# ---------------------------------------------------------------------------------------------------------------
EXTRA = ['Language', 'Choose a language']           # strings that only appear in the generated blocks
GLOBE = ('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
         'stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>'
         '<path d="M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9Z"/></svg>')
CHEV = ('<svg class="lang__chev" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg>')


def depth(page):
    return len([p for p in page.split('/') if p])


def link_to(cur, page, target):
    """Relative URL from a page (in the `cur` language tree) to the same page in the `target` tree."""
    up = '../' * (depth(page) + (0 if cur == 'en' else 1))
    path = ('' if target == 'en' else target + '/') + page
    return (up + path) or './'


def lang_links(cur, page, label):
    out = []
    for code in LANGS:
        out.append('<a translate="no" lang="%s" hreflang="%s" data-lang="%s" href="%s"%s>%s</a>' % (
            code, code, code, link_to(cur, page, code), ' aria-current="true"' if code == cur else '', label(code)))
    return ''.join(out)


def head_block(cur, page, T, version):
    def url(code):
        return '%s/%s%s' % (SITE, '' if code == 'en' else code + '/', page)
    parts = ['<link rel="alternate" hreflang="%s" href="%s"/>' % (c, url(c)) for c in LANGS]
    parts.append('<link rel="alternate" hreflang="x-default" href="%s"/>' % url('en'))
    parts += ['<meta property="og:locale:alternate" content="%s"/>' % LOCALES[c] for c in LANGS if c != cur]
    if cur == 'ja':
        parts.append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&amp;display=swap"/>')
    if cur != 'en':
        parts.append('<script src="%sjs/i18n/%s.js?v=%s"></script>' % ('../' * (depth(page) + 1), cur, version))
    js = ["(function(){document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-lang]');"
          "if(a)try{localStorage.setItem('hx-lang',a.getAttribute('data-lang'))}catch(_){}});"]
    if cur == 'en':
        targets = {c: link_to('en', page, c) for c in LANGS if c != 'en'}
        js.append("var S=%s,l=null;try{l=localStorage.getItem('hx-lang')}catch(_){}"
                  "if(!l){var n=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];"
                  "for(var i=0;i<n.length;i++){var c=String(n[i]).toLowerCase().split(/[-_]/)[0];if(c==='en'||S[c]){l=c;break}}}"
                  "if(l&&S[l])location.replace(S[l]+location.search+location.hash);" % json.dumps(targets, separators=(',', ':')))
    js.append('})()')
    parts.append('<script>%s</script>' % ''.join(js))
    return '\n'.join(parts)


def nav_block(cur, page, T):
    label = T('Language')
    return ('<details class="lang" data-lang-menu><summary class="lang__btn" aria-label="%s" title="%s">%s<span translate="no">%s</span>%s</summary>'
            '<div class="lang__list">%s</div></details>' % (label, label, GLOBE, cur.upper(), CHEV, lang_links(cur, page, lambda c: NAMES[c])))


def mmenu_block(cur, page, T):
    return '<div class="mmenu__lang" role="group" aria-label="%s">%s</div>' % (T('Language'), lang_links(cur, page, lambda c: NAMES[c]))


def foot_block(cur, page, T):
    return '<nav class="foot__lang" aria-label="%s">%s</nav>' % (T('Language'), lang_links(cur, page, lambda c: NAMES[c]))


BLOCKS = {'head': head_block, 'nav': nav_block, 'mmenu': mmenu_block, 'foot': foot_block}
MARK = re.compile(r'<!--lang:(\w+)-->.*?<!--/lang:\1-->', re.S)


def fill_blocks(text, cur, page, T, version):
    def sub(m):
        name = m.group(1)
        fn = BLOCKS[name]
        body = fn(cur, page, T, version) if name == 'head' else fn(cur, page, T)
        return '<!--lang:%s-->%s<!--/lang:%s-->' % (name, body, name)
    return MARK.sub(sub, text)


# ---------------------------------------------------------------------------------------------------------------
# Building a language
# ---------------------------------------------------------------------------------------------------------------
def load_lang(code):
    path = os.path.join(LANG_DIR, code + '.json')
    if not os.path.exists(path):
        return {'html': {}, 'js': {}}
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    d.setdefault('html', {})
    d.setdefault('js', {})
    return d


def tag_sig(s):
    return sorted(re.findall(r'<\s*([a-zA-Z][a-zA-Z0-9]*)', s)), sorted(re.findall(r'href="([^"]*)"', s))


def fix_entities(s):
    return re.sub(r'&(?!#?\w+;)', '&amp;', s)


def make_tr(tdict, problems):
    def tr(key):
        v = tdict.get(key)
        if not v or not v.strip():
            problems['missing'].add(key)
            return None
        v = fix_entities(norm(v))
        if tag_sig(v) != tag_sig(key):
            problems['tags'].append((key, v))
            return None
        return v
    return tr


def relocate(url, page, code):
    """Asset URL of an English page -> the same file as seen from the localized copy of that page."""
    if not url or url.startswith(('#', '/')) or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', url):
        return url
    m = re.match(r'^([^?#]*)(.*)$', url)
    path, rest = m.group(1), m.group(2)
    if not ASSET_EXT.search(path):
        return url
    target = os.path.normpath(os.path.join(page, path)).replace('\\', '/')
    start = (code + '/' + page).rstrip('/')
    return os.path.relpath(target, start).replace('\\', '/') + rest


def localize(text, code, page, tdict, problems):
    root = H.parse(text)
    Walker(make_tr(tdict, problems), lambda m: None).run(root)
    for el in root.find_all():
        if not isinstance(el, H.Element):
            continue
        for a in URL_ATTRS:
            v = el.get(a)
            if v:
                n = relocate(v, page.rstrip('/'), code)
                if n != v:
                    el.set(a, n)
    root.find('html').set('lang', code)
    canon = SITE + '/' + code + '/' + page
    for el in root.find_all('link'):
        if el.get('rel') == 'canonical':
            el.set('href', canon)
    for el in root.find_all('meta'):
        if el.get('property') == 'og:url':
            el.set('content', canon)
        if el.get('property') == 'og:locale':
            el.set('content', LOCALES[code])
    return H.serialize_doc(root)


def build(only=None):
    version = '0'
    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as f:
        m = re.search(r'name="haxurus-build" content="([^"]+)"', f.read())
    if m:
        version = m.group(1)
    report = {}
    for code in LANGS:
        if only and code not in only and code != 'en':
            continue
        data = load_lang(code)
        T = (lambda k, d=data: (d['html'].get(k) or k)) if code != 'en' else (lambda k: k)
        problems = {'missing': set(), 'tags': []}
        for page in PAGES:
            src_path = os.path.join(ROOT, page, 'index.html')
            with open(src_path, encoding='utf-8') as f:
                english = f.read()
            english = fill_blocks(english, 'en', page, lambda k: k, version)
            if code == 'en':
                with open(src_path, 'w', encoding='utf-8', newline='') as f:
                    f.write(english)
                continue
            out = fill_blocks(localize(english, code, page, data['html'], problems), code, page, T, version)
            dest = os.path.join(ROOT, code, page)
            os.makedirs(dest, exist_ok=True)
            with open(os.path.join(dest, 'index.html'), 'w', encoding='utf-8', newline='') as f:
                f.write(out)
        if code != 'en':
            js = {k: v for k, v in data['js'].items() if v and v.strip()}
            os.makedirs(os.path.join(ROOT, 'js', 'i18n'), exist_ok=True)
            with open(os.path.join(ROOT, 'js', 'i18n', code + '.js'), 'w', encoding='utf-8', newline='') as f:
                f.write('window.HX_I18N=%s;\n' % json.dumps(js, ensure_ascii=False))
            report[code] = problems
    write_sitemap()
    for code, pr in report.items():
        print('%s: %d strings missing from the language file, %d with broken tags' % (code, len(pr['missing']), len(pr['tags'])))
        for key, v in pr['tags'][:20]:
            print('   TAGS', key[:90], '=>', v[:90])
    return report


def write_sitemap():
    path = os.path.join(ROOT, 'sitemap.xml')
    with open(path, encoding='utf-8') as f:
        old = f.read()
    last = {}
    for loc, mod in re.findall(r'<loc>https://haxurus\.com/([^<]*)</loc>\s*(?:<lastmod>([^<]*)</lastmod>)?', old):
        if not re.match(r'^(%s)/' % '|'.join(LANGS[1:]), loc) and mod:
            last[loc] = mod
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page in PAGES:
        mod = last.get(page)
        for code in LANGS:
            out.append('  <url>\n    <loc>%s/%s%s</loc>' % (SITE, '' if code == 'en' else code + '/', page))
            if mod:
                out.append('    <lastmod>%s</lastmod>' % mod)
            for c in LANGS:
                out.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s/%s%s"/>' % (c, SITE, '' if c == 'en' else c + '/', page))
            out.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s/%s"/>' % (SITE, page))
            out.append('  </url>')
    out.append('</urlset>')
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write('\n'.join(out) + '\n')


if __name__ == '__main__':
    if '--catalog' in sys.argv:
        write_catalog()
    else:
        build([a for a in sys.argv[1:] if a in LANGS] or None)
