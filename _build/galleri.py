#!/usr/bin/env python3
"""
Bygger bildalbumen på galleri.html och bildlistan i sitemap.xml.

Albumen (ett per festivalår), bilderna och deras alt-texter står i
_build/galleri.json. Lägg till ett album eller en bild där och kör sedan:

    python3 _build/galleri.py

Skriptet skriver om allt mellan
    <!-- RV-GALLERI-GENVAGAR START --> … <!-- RV-GALLERI-GENVAGAR SLUT -->  i galleri.html
    <!-- RV-GALLERI START -->  …  <!-- RV-GALLERI SLUT -->                   i galleri.html
    <!-- RV-GALLERI-BILDER START --> … <!-- RV-GALLERI-BILDER SLUT -->       i sitemap.xml

Bildfilerna ska ligga i images/foto/ som NAMN-800.webp och NAMN-1600.webp
(stående bilder: NAMN-600.webp och NAMN-1200.webp).
Kräver Pillow (pip install pillow) för att läsa bildernas mått.
"""
import html
import json
import pathlib
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow saknas: kör  pip install pillow')

ROT = pathlib.Path(__file__).resolve().parent.parent
FOTO = ROT / 'images' / 'foto'
DOMAN = 'https://www.rivervalley.se/'   # RV-ADRESS


def storlekar(namn):
    """Returnerar [(bredd, höjd, sökväg)] för de webp-storlekar som finns."""
    ut = []
    for s in (600, 800, 1200, 1600, 1800, 2400):
        fil = FOTO / f'{namn}-{s}.webp'
        if fil.exists():
            with Image.open(fil) as im:
                ut.append((im.width, im.height, f'images/foto/{fil.name}'))
    if not ut:
        sys.exit(f'Hittar inga filer för {namn} i images/foto/')
    return ut


def bild_html(b):
    s = storlekar(b['namn'])
    liten = s[0]
    stor = s[1] if len(s) > 1 else s[0]          # 1600/1200 räcker i förstoringen
    srcset = ', '.join(f'{p} {w}w' for w, h, p in s[:2])
    alt = html.escape(b['alt'], quote=True)
    return (
        f'                    <a href="{stor[2]}" data-forstora>\n'
        f'                        <img src="{liten[2]}" srcset="{srcset}"\n'
        f'                             sizes="(min-width: 900px) 33vw, 50vw"\n'
        f'                             width="{liten[0]}" height="{liten[1]}" loading="lazy" decoding="async"\n'
        f'                             alt="{alt}">\n'
        f'                    </a>'
    )


def main():
    data = json.loads((ROT / '_build' / 'galleri.json').read_text(encoding='utf-8'))
    delar = []
    sitemap = []
    for i, a in enumerate(data['album']):
        klass = 'sektion' + (' sektion--kol2' if i % 2 else '')
        bilder = '\n'.join(bild_html(b) for b in a['bilder'])
        delar.append(
            f'        <section class="{klass}" id="album-{a["id"]}" aria-labelledby="rubrik-{a["id"]}" data-album>\n'
            f'            <div class="matt">\n'
            f'                <div class="sektion-topp">\n'
            f'                    <p class="overrubrik">{len(a["bilder"])} bilder</p>\n'
            f'                    <h2 id="rubrik-{a["id"]}">{html.escape(a["rubrik"])}</h2>\n'
            f'                    <p class="ingress">{html.escape(a["text"])}</p>\n'
            f'                </div>\n'
            f'                <div class="murverk">\n'
            f'{bilder}\n'
            f'                </div>\n'
            f'            </div>\n'
            f'        </section>'
        )
        for b in a['bilder']:
            stor = storlekar(b['namn'])[1][2]
            sitemap.append(
                f'    <image:image><image:loc>{DOMAN}{stor}</image:loc></image:image>'
            )

    genvagar = (
        '        <nav class="matt galleri-genvagar" aria-label="Album">\n'
        '            <ul class="innehall-lankar">\n'
        + ''.join(f'                <li><a href="#album-{a["id"]}">{html.escape(a["rubrik"])}</a></li>\n' for a in data['album'])
        + '            </ul>\n'
        '        </nav>'
    )

    sida = ROT / 'galleri.html'
    text = sida.read_text(encoding='utf-8')
    text = re.sub(
        r'(<!-- RV-GALLERI-GENVAGAR START[^>]*-->\n)(.*?)([ \t]*<!-- RV-GALLERI-GENVAGAR SLUT -->)',
        lambda m: m.group(1) + genvagar + '\n        ' + m.group(3).strip(),
        text, flags=re.S)
    text = re.sub(
        r'(<!-- RV-GALLERI START[^>]*-->\n)(.*?)([ \t]*<!-- RV-GALLERI SLUT -->)',
        lambda m: m.group(1) + '\n\n'.join(delar) + '\n        ' + m.group(3).strip(),
        text, flags=re.S)
    sida.write_text(text, encoding='utf-8')

    karta = ROT / 'sitemap.xml'
    xml = karta.read_text(encoding='utf-8')
    xml = re.sub(
        r'(<!-- RV-GALLERI-BILDER START -->\n)(.*?)([ \t]*<!-- RV-GALLERI-BILDER SLUT -->)',
        lambda m: m.group(1) + '\n'.join(sitemap) + '\n    ' + m.group(3).strip(),
        xml, flags=re.S)
    karta.write_text(xml, encoding='utf-8')

    antal = sum(len(a['bilder']) for a in data['album'])
    print(f'Galleriet uppdaterat: {antal} bilder i {len(data["album"])} album.')


if __name__ == '__main__':
    main()
