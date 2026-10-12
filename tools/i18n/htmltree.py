"""A tiny dependency-free HTML tree (parse -> edit -> serialize) built on the standard library.

It keeps text and entities exactly as written in the source, keeps attribute order, and writes void elements
as <tag .../>. That is all the i18n build needs; it is not a general HTML5 parser.
"""
from html.parser import HTMLParser

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
RAW = {'script', 'style'}


class Node:
    parent = None


class Text(Node):
    def __init__(self, raw):
        self.raw = raw


class Comment(Node):
    def __init__(self, raw):
        self.raw = raw


class Decl(Node):
    def __init__(self, raw):
        self.raw = raw


class Element(Node):
    def __init__(self, tag, attrs):
        self.tag = tag
        self.attrs = [list(a) for a in attrs]
        self.children = []

    # attributes ---------------------------------------------------------
    def get(self, name, default=None):
        for k, v in self.attrs:
            if k == name:
                return v
        return default

    def has(self, name):
        return any(k == name for k, _ in self.attrs)

    def set(self, name, value):
        for a in self.attrs:
            if a[0] == name:
                a[1] = value
                return
        self.attrs.append([name, value])

    def remove(self, name):
        self.attrs = [a for a in self.attrs if a[0] != name]

    def classes(self):
        return (self.get('class') or '').split()

    # tree ---------------------------------------------------------------
    def append(self, node):
        node.parent = self
        self.children.append(node)

    def elements(self):
        return [c for c in self.children if isinstance(c, Element)]

    def walk(self):
        for c in self.children:
            yield c
            if isinstance(c, Element):
                yield from c.walk()

    def find_all(self, tag=None, **attrs):
        for n in self.walk():
            if isinstance(n, Element) and (tag is None or n.tag == tag) and all(n.get(k) == v for k, v in attrs.items()):
                yield n

    def find(self, tag=None, **attrs):
        return next(self.find_all(tag, **attrs), None)

    def inner(self):
        return ''.join(serialize(c) for c in self.children)

    def set_inner(self, html):
        self.children = []
        for n in parse_fragment(html):
            self.append(n)


class Root(Element):
    def __init__(self):
        super().__init__('#root', [])


def esc_attr(v):
    return v.replace('&', '&amp;').replace('"', '&quot;')


class _Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Root()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        el = Element(tag, attrs)
        self.stack[-1].append(el)
        if tag not in VOID:
            self.stack.append(el)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].append(Element(tag, attrs))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def _text(self, raw):
        cur = self.stack[-1]
        if cur.children and isinstance(cur.children[-1], Text):
            cur.children[-1].raw += raw
        else:
            cur.append(Text(raw))

    def handle_data(self, data):
        self._text(data)

    def handle_entityref(self, name):
        self._text('&%s;' % name)

    def handle_charref(self, name):
        self._text('&#%s;' % name)

    def handle_comment(self, data):
        self.stack[-1].append(Comment(data))

    def handle_decl(self, decl):
        self.stack[-1].append(Decl(decl))


def parse(html):
    p = _Parser()
    p.feed(html)
    p.close()
    return p.root


def parse_fragment(html):
    root = parse(html)
    return list(root.children)


def serialize(node):
    if isinstance(node, Text):
        return node.raw
    if isinstance(node, Comment):
        return '<!--%s-->' % node.raw
    if isinstance(node, Decl):
        return '<!%s>' % node.raw
    parts = ['<', node.tag]
    for k, v in node.attrs:
        parts.append(' ' + k if v is None else ' %s="%s"' % (k, esc_attr(v)))
    if node.tag in VOID:
        parts.append('/>')
        return ''.join(parts)
    parts.append('>')
    parts.extend(serialize(c) for c in node.children)
    parts.append('</%s>' % node.tag)
    return ''.join(parts)


def serialize_doc(root):
    return ''.join(serialize(c) if not isinstance(c, Text) else c.raw for c in root.children)
