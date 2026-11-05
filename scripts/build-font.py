"""Rebuild public/fonts/metro-sign-sans.woff2 from Encode Sans (SIL OFL 1.1).

Metron, Jiri Rathousky's 1970s Prague metro signage face, is a commercial Storm Type family. The
closest free match is Encode Sans at width 112.5: squarish bowls, straight-cut terminals, open
apertures, a splayed M. This script instances it at that width (weights 400-700 stay variable),
subsets it to Latin + Latin Extended-A (all Czech letters) and the punctuation the page uses, and
renames it "Metro Sign Sans" because the OFL reserves the name "Encode Sans" for unmodified copies.

    pip install fonttools brotli
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/encodesans/EncodeSans%5Bwdth,wght%5D.ttf"
    python3 scripts/build-font.py "EncodeSans[wdth,wght].ttf"
"""
import hashlib
import io
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

NAME = 'Metro Sign Sans'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'fonts', 'metro-sign-sans.woff2')
# the google/fonts file this was built from on 2026-11-05; a different source gives a different font
SOURCE_SHA256 = '7735320abb63a1022d086c938872dae32754db733ecd4dcd402f2a445cbeb43f'
UNICODES = (list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + list(range(0x2010, 0x2028))
            + list(range(0x2030, 0x203B)) + [0x2190, 0x2191, 0x2192, 0x2193, 0x2212])

with open(sys.argv[1], 'rb') as fh:
    digest = hashlib.sha256(fh.read()).hexdigest()
if digest != SOURCE_SHA256:
    sys.exit(f'source is not the pinned Encode Sans file: sha256 {digest}')
font = TTFont(sys.argv[1], lazy=False)
font = instancer.instantiateVariableFont(font, {'wdth': 112.5, 'wght': (400, 700)})
buf = io.BytesIO()
font.save(buf)
buf.seek(0)
font = TTFont(buf, lazy=False)

opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'ccmp', 'locl', 'mark', 'mkmk']
opts.name_IDs = ['*']
opts.name_languages = ['*']
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(unicodes=UNICODES)
sub.subset(font)

names = font['name']
for rec in list(names.names):
    if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22):
        names.removeNames(nameID=rec.nameID)
for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
    names.setName(NAME, 1, pid, eid, lid)
    names.setName('Regular', 2, pid, eid, lid)
    names.setName(NAME + ' Regular', 4, pid, eid, lid)
    names.setName('MetroSignSans-Regular', 6, pid, eid, lid)
    names.setName(NAME + '; derived from Encode Sans (OFL 1.1), width 112.5, Latin + Czech subset, 2026-11-05', 3, pid, eid, lid)
names.setName('Modified from Encode Sans by The Encode Project Authors: instanced at width 112.5 and subset to '
              'Latin and Latin Extended-A for metro.dravec.org, 2026-11-05. Licensed under the SIL Open Font '
              'License 1.1.', 10, 3, 1, 0x409)
font.flavor = 'woff2'
font.save(OUT)
missing = [hex(u) for u in range(0x100, 0x17F) if u not in font.getBestCmap() and u not in (0x132, 0x133)]
print(OUT, 'missing Latin Extended-A:', missing)
