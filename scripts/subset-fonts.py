"""Trim Fraunces to what the site uses (needs fonttools + brotli).

    python3 scripts/subset-fonts.py

- Roman: SOFT pinned at 50, WONK at 0, weight 450-700, optical size 36-144,
  Latin-1 + typographic punctuation.
- Italic: a static instance (opsz 144, wght 600, SOFT 100, WONK 1) for the
  hero's "bloom.", basic Latin only.
Writes src/fonts/*.woff2. Fraunces is SIL Open Font License 1.1.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'node_modules/@fontsource-variable/fraunces/files'
OUT = ROOT / 'src/fonts'
OUT.mkdir(parents=True, exist_ok=True)

LATIN1 = 'U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2032-2033'
BASIC = 'U+0020-007E'


def build(src, dst, limits, unicodes):
    font = TTFont(src)
    font = instancer.instantiateVariableFont(font, limits)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(unicodes))
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(dst)
    print(f'{dst.name}: {dst.stat().st_size / 1024:.1f} KB')


build(SRC / 'fraunces-latin-full-normal.woff2', OUT / 'fraunces-roman.woff2',
      {'SOFT': 50, 'WONK': 0, 'wght': (450, 700), 'opsz': (36, 144)}, LATIN1)
build(SRC / 'fraunces-latin-full-italic.woff2', OUT / 'fraunces-italic-bloom.woff2',
      {'SOFT': 100, 'WONK': 1, 'wght': 600, 'opsz': 144}, BASIC)
