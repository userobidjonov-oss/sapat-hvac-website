"""Build translated copies of index.html.

Usage:
  python tools/i18n_build.py extract          -> prints untranslated strings (per language) as JSON
  python tools/i18n_build.py build            -> writes ar/index.html and ru/index.html

English index.html is the single source. Translations live in i18n/<lang>.json as
{"English text": "translation"}. Matching is done on whitespace-normalised text nodes
and on alt / aria-label / placeholder / title / meta content attributes.
"""
import html
import io
import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
LANGS = {
    "ar": {"dir": "rtl", "label": "العربية"},
    "ru": {"dir": "ltr", "label": "Русский"},
}
TRANSLATABLE_ATTRS = {"alt", "aria-label", "placeholder", "title"}
META_CONTENT_KEYS = {"description", "keywords", "og:title", "og:description"}
URL_ATTRS = {"src", "href", "poster"}
RAW_TAGS = {"script", "style"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def norm(text):
    return re.sub(r"\s+", " ", text).strip()


def has_words(text):
    return bool(re.search(r"[A-Za-z]{2,}", text))


class Rewriter(HTMLParser):
    def __init__(self, tr=None, lang=None, collect=None):
        super().__init__(convert_charrefs=True)
        self.tr = tr or {}
        self.lang = lang
        self.collect = collect
        self.out = []
        self.raw = 0

    # -- helpers --
    def t(self, text):
        key = norm(text)
        if not key or not has_words(key):
            return text
        if self.collect is not None:
            if key not in self.collect:
                self.collect.append(key)
            return text
        if key in self.tr:
            lead = text[: len(text) - len(text.lstrip())]
            trail = text[len(text.rstrip()):]
            return lead + self.tr[key] + trail
        return text

    def fix_url(self, value):
        if self.lang is None or not value:
            return value
        if value == "./":
            return "../"
        if self.lang and value == f"{self.lang}/":
            return "./"
        if re.match(r"^(#|https?:|mailto:|tel:|data:|/|\.\./)", value):
            return value
        return "../" + value

    def attrs_str(self, tag, attrs):
        d = dict(attrs)
        parts = []
        for k, v in attrs:
            if v is None:
                parts.append(k)
                continue
            if k in TRANSLATABLE_ATTRS:
                v = self.t(v)
            elif k == "content" and tag == "meta" and (d.get("name") in META_CONTENT_KEYS or d.get("property") in META_CONTENT_KEYS):
                v = self.t(v)
            elif k in URL_ATTRS:
                v = self.fix_url(v)
            parts.append(f'{k}="{html.escape(v, quote=True)}"')
        return (" " + " ".join(parts)) if parts else ""

    # -- parser callbacks --
    def handle_decl(self, decl):
        self.out.append(f"<!{decl}>")

    def handle_starttag(self, tag, attrs):
        if tag == "html" and self.lang:
            attrs = [(k, v) for k, v in attrs if k not in ("lang", "dir")]
            attrs = [("lang", self.lang), ("dir", LANGS[self.lang]["dir"])] + attrs
        self.out.append(f"<{tag}{self.attrs_str(tag, attrs)}>")
        if tag in RAW_TAGS:
            self.raw += 1

    def handle_startendtag(self, tag, attrs):
        self.out.append(f"<{tag}{self.attrs_str(tag, attrs)} />")

    def handle_endtag(self, tag):
        if tag in RAW_TAGS:
            self.raw -= 1
        if tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if self.raw:
            self.out.append(data)
        else:
            self.out.append(html.escape(self.t(data), quote=False))

    def handle_comment(self, data):
        self.out.append(f"<!--{data}-->")


def load_tr(lang):
    path = os.path.join(ROOT, "i18n", f"{lang}.json")
    if not os.path.exists(path):
        return {}
    with io.open(path, encoding="utf-8") as f:
        return json.load(f)


def extract():
    src = io.open(SRC, encoding="utf-8").read()
    keys = []
    Rewriter(collect=keys).feed(src)
    report = {lang: [k for k in keys if k not in load_tr(lang)] for lang in LANGS}
    print(json.dumps({"total": len(keys), "missing": report}, ensure_ascii=False, indent=1))


def build():
    src = io.open(SRC, encoding="utf-8").read()
    for lang in LANGS:
        tr = load_tr(lang)
        p = Rewriter(tr=tr, lang=lang)
        p.feed(src)
        p.close()
        out = "".join(p.out)
        # Per-language runtime strings for main.js
        js_tr = {k[3:]: v for k, v in tr.items() if k.startswith("js:")}
        fonts = {
            "ar": "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap",
            "ru": "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap",
        }
        inject = (f'<link href="{fonts[lang]}" rel="stylesheet">\n'
                  f"<script>window.I18N = {json.dumps(js_tr, ensure_ascii=False)};</script>")
        out = out.replace("</head>", inject + "\n</head>", 1)
        os.makedirs(os.path.join(ROOT, lang), exist_ok=True)
        with io.open(os.path.join(ROOT, lang, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(out)
        keys = []
        Rewriter(collect=keys).feed(src)
        missing = [k for k in keys if k not in tr]
        print(f"{lang}: written, {len(missing)} untranslated")


if __name__ == "__main__":
    {"extract": extract, "build": build}[sys.argv[1]]()
