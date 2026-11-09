# rivervalley.se

Sajten för River Valley Countryfestival, countryfestivalen på Boggbergets
festplats i Evertsberg, Älvdalen. Arrangeras av Vildbyn.

Vanlig HTML och CSS på GitHub Pages, utan byggsteg. Allt som pushas till `main`
går live direkt.

**Läge just nu: utkast.** Sajten ligger på
`gabrielsoors-cmd.github.io/rivervalley/` och är dold för Google (`noindex`).
Den gamla Wix-sajten ligger kvar på www.rivervalley.se tills ni byter.

## Sidor

| Fil | Sida |
| --- | --- |
| `index.html` | Hem, med nedräkning till biljettsläppet |
| `biljetter.html` | Biljetter & camping (platser för Kwikk) |
| `program.html` | Program 2027, scener, tidigare artister, Open Stage |
| `festivalen.html` | Om festivalen, aktiviteter, var med, press |
| `boende.html` | Festivalcampen, boende i Evertsberg och Älvdalen |
| `praktisk-info.html` | Hitta hit, regler, ålder, vanliga frågor |
| `galleri.html` | Album från 2026 och 2024 (byggs från `_build/galleri.json`) |
| `kontakt.html` | Kontakt |
| `404.html` | Visas när en sida saknas (absoluta sökvägar, se RV-ADRESS) |
| `festivalpass.html`, `aktiviteter.html`, `kontakta-oss.html`, `artister.html`, `boka-boende.html` | Gamla Wix-adresser som skickar vidare till nya sidor |

## Markeringar i koden

Sök efter dessa för att hitta rätt ställe direkt:

| Markering | Var | Vad |
| --- | --- | --- |
| `RV-SLAPP` | `js/main.js` | När biljetterna släpps (nedräkningen räknar hit) |
| `RV-DATUM` | `js/main.js` | När festivalen öppnar och stänger |
| `RV-BILJETTER` | `biljetter.html` | Biljettbutiken. Steg för steg när Kwikk är klart |
| `RV-CAMPING` | `biljetter.html` | Bokning av campingplatser |
| `RV-PROGRAM` | `program.html` | Dagarna, artisterna och öppettiderna |
| `RV-EVENT-DATA` | `index.html`, `program.html` | Strukturerad data för Google och AI-sök |
| `RV-FAQ-DATA` | `praktisk-info.html` | Vanliga frågor för Google |
| `RV-UTKAST` | `_build/partials/` | `noindex` och utkastbandet. Tas bort vid lansering |
| `RV-ADRESS` | `_build/sync.py`, `_build/galleri.py`, `404.html` | Sajtens adress |
| `RV:SIDHUVUD`, `RV:SIDFOT`, `RV:GEMENSAM-HEAD` | alla sidor | Gemensamma delar, se nedan |

## Gemensam meny och sidfot

Menyn, sidfoten och det gemensamma i `<head>` ligger i `_build/partials/`.
Ändra där och kör:

```
python3 _build/sync.py
```

Skriptet kopierar in delarna mellan markeringarna i varje sida och markerar
aktuell sida i menyn. Mappen `_build` publiceras inte (GitHub Pages hoppar över
mappar som börjar med understreck).

## Nedräkningen

Står i `js/main.js`. Före släppet räknar den ner till `RV-SLAPP`
(1 december 2026 kl. 12.00). Efter släppet byter den till "Biljetterna är ute!"
och räknar ner till festivalen. Under festivalen står det "Nu kör vi!", och
efteråt döljs den. Tiderna skrivs med svensk tidszon, så den visar rätt även
för besökare utomlands. Utan JavaScript syns texten "Biljettsläpp 1 december
kl. 12.00".

## När biljetterna släpps

Steg för steg står i kommentaren under `RV-BILJETTER` i `biljetter.html`.
Se till att Kwikk-butiken är inlagd innan 1 december kl. 12.00, annars säger
nedräkningen "Biljetterna är ute!" medan sidan fortfarande visar platshållaren.

## Lansering (byta från Wix)

1. Ta bort allt under `RV-UTKAST` i `_build/partials/head.html` och
   `_build/partials/header.html`. Kör `python3 _build/sync.py`.
2. Byt `BAS_404` i `_build/sync.py` och länkarna i `404.html` från
   `/rivervalley/` till `/`.
3. Lägg en fil `CNAME` i roten med texten `www.rivervalley.se`.
4. Hos domänleverantören: peka `www` (CNAME) mot `gabrielsoors-cmd.github.io`
   och apex-domänen (A-poster) mot GitHub Pages IP-adresser
   (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
5. I GitHub: Settings → Pages → Custom domain `www.rivervalley.se`, och
   bocka i "Enforce HTTPS" när certifikatet är klart.
6. Säg upp Wix-planen först när allt fungerar.

## Bildgalleriet

Albumen på `galleri.html` och bildernas alt-texter står i `_build/galleri.json`,
ett album per år. Lägg till en bild där och kör `python3 _build/galleri.py`.
Skriptet bygger albumen och bildlistan i `sitemap.xml`. Alla länkar med
`data-forstora` öppnas förstorade i en ruta och bläddrar inom samma album.

## Bilder

- Festivalbilder ligger i `images/foto/` och heter
  `rv-ÅR-vad-som-syns-BREDD.webp`, t.ex. `rv-2026-countrykoren-1600.webp`.
  Varje bild finns i 800 och 1600 px bredd (2026 även 2400). EXIF och GPS är
  borttaget.
- Varje bild har en `alt`-text som beskriver vad som syns.
- Bilderna från 2024 är tagna av Tobbe Nilsson. Fotograf för 2026: fyll i.
- Delningsbilden för Facebook m.fl. är `images/og-river-valley-2027.jpg`
  (1200 × 630).
- Loggan finns i vitt och svart: `images/rv-logga-vit-*.webp`,
  `images/rv-logga-svart-*.webp`. Favicon och appikoner är hatten ur loggan.

## Design

- Svart och vitt, som loggan. Färger och mått ligger som variabler överst i
  `css/style.css`. Använd dem i stället för att skriva färgkoder.
- Typsnitt: Oswald (rubriker), Bitter (brödtext) och Rye (små westernaccenter,
  sparsamt). Självhostade i `fonts/`, SIL Open Font License.
- Biljetterna ser ut som rivna biljettstubbar, artisterna står som på en
  spelningsaffisch (varannan fylld, varannan konturerad).
- Mobilen först: grundreglerna gäller mobil, `@media` lägger på för större
  skärmar.

## SEO

- Titlar: `Sidnamn | River Valley Countryfestival 2027, Älvdalen`.
- Varje sida har egen `description`, `canonical` (mot www.rivervalley.se) och
  Open Graph-taggar.
- `sitemap.xml`, `robots.txt` och `llms.txt` ligger i roten.
- Filnamnen `boende`, `festivalen` och `praktisk-info` är samma som på
  Wix-sajten, så gamla länkar fortsätter att fungera.

## Cookies

Sajten sätter inga cookies och har ingen spårning.
