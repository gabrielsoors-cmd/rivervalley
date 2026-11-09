/* ==========================================================================
   RIVER VALLEY COUNTRYFESTIVAL – JAVASCRIPT
   1. Mobilmenyn
   2. Nedräkningen (biljettsläpp → festivalstart)
   3. Förstora bilder (galleriet)
   4. Kartan (laddas först vid klick)
   Sajten sätter inga cookies och har ingen spårning. Google-kartan laddas
   bara om besökaren själv klickar på den.
   ========================================================================== */

(function () {
    'use strict';

    /* ---------- Inställningar ----------
       RV-SLAPP: när biljetterna släpps. RV-DATUM: när festivalen öppnar och
       stänger. Skriv tiden med svensk tidszon på slutet: +01:00 på vintern,
       +02:00 på sommaren. */
    var BILJETTSLAPP = '2026-12-01T12:00:00+01:00';    // RV-SLAPP
    // Öppettiderna är inte klara. Tills vidare räknar den till midnatt 1 juli.
    // Byt till rätt klockslag när tiderna släpps (t.ex. T18:00:00+02:00).
    var FESTIVAL_START = '2027-07-01T00:00:00+02:00';  // RV-DATUM: torsdag
    var FESTIVAL_SLUT = '2027-07-04T03:00:00+02:00';   // RV-DATUM: natten mot söndag

    /* ---------- 1. Mobilmenyn ---------- */
    var menyKnapp = document.querySelector('.meny-knapp');
    var meny = document.getElementById('huvudmeny');

    function stangMeny() {
        if (!menyKnapp || !meny) return;
        meny.classList.remove('oppen');
        menyKnapp.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('meny-oppen');
    }

    if (menyKnapp && meny) {
        menyKnapp.addEventListener('click', function () {
            if (menyKnapp.getAttribute('aria-expanded') === 'true') {
                stangMeny();
            } else {
                // Menyn börjar precis under sidhuvudet (utkastbandet kan ligga ovanför)
                var sidhuvud = document.querySelector('.sidhuvud');
                if (sidhuvud) meny.style.setProperty('--meny-topp', Math.round(sidhuvud.getBoundingClientRect().bottom) + 'px');
                meny.classList.add('oppen');
                menyKnapp.setAttribute('aria-expanded', 'true');
                document.body.classList.add('meny-oppen');
            }
        });
        meny.addEventListener('click', function (e) {
            if (e.target.closest('a')) stangMeny();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') stangMeny();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 1080) stangMeny();
        });
    }

    /* ---------- 2. Nedräkningen ----------
       Före släppet: räknar ner till biljettsläppet.
       Efter släppet: räknar ner till festivalen.
       Under festivalen: "Nu kör vi!". Efteråt döljs siffrorna.
       Utan JavaScript syns den fasta texten i .nedrakning-fast. */
    var nedrakningar = Array.prototype.slice.call(document.querySelectorAll('[data-nedrakning]'));
    var slapp = Date.parse(BILJETTSLAPP);
    var start = Date.parse(FESTIVAL_START);
    var slut = Date.parse(FESTIVAL_SLUT);

    function tvaSiffror(n) { return (n < 10 ? '0' : '') + n; }

    function uppdatera() {
        var nu = Date.now();
        var mal, etikett;
        if (nu < slapp) {
            mal = slapp;
            etikett = 'Biljetterna släpps om';
        } else if (nu < start) {
            mal = start;
            etikett = 'Biljetterna är ute! Vi kör igång om';
        } else if (nu < slut) {
            mal = null;
            etikett = 'Nu kör vi! Välkommen till Boggberget.';
        } else {
            mal = null;
            etikett = '';
        }

        nedrakningar.forEach(function (el) {
            var etikettEl = el.querySelector('.nedrakning-etikett');
            var siffror = el.querySelector('.nedrakning-siffror');
            var fast = el.querySelector('.nedrakning-fast');
            if (etikettEl) etikettEl.textContent = etikett;
            if (fast) fast.hidden = nu >= slapp;   // "Biljettsläpp 1 december" behövs inte efter släppet
            if (!mal) {
                if (siffror) siffror.hidden = true;
                if (!etikett) el.hidden = true;
                return;
            }
            var kvar = Math.max(0, Math.floor((mal - nu) / 1000));
            var d = Math.floor(kvar / 86400);
            var t = Math.floor((kvar % 86400) / 3600);
            var m = Math.floor((kvar % 3600) / 60);
            var s = kvar % 60;
            el.querySelector('[data-enhet="dagar"]').textContent = d;
            el.querySelector('[data-enhet="timmar"]').textContent = tvaSiffror(t);
            el.querySelector('[data-enhet="minuter"]').textContent = tvaSiffror(m);
            el.querySelector('[data-enhet="sekunder"]').textContent = tvaSiffror(s);
        });
    }

    if (nedrakningar.length && !isNaN(slapp)) {
        nedrakningar.forEach(function (el) { el.classList.add('igang'); });
        uppdatera();
        setInterval(uppdatera, 1000);
    }

    /* ---------- 3. Förstora bilder ----------
       Alla länkar med data-forstora öppnas i en ruta i stället för att
       lämna sidan. Knappar, svep och piltangenter bläddrar, Esc stänger.
       Bläddringen håller sig inom samma album (data-album). */
    var forstoraLankar = Array.prototype.slice.call(document.querySelectorAll('a[data-forstora]'));
    if (forstoraLankar.length && typeof HTMLDialogElement === 'function') {
        var ruta = document.createElement('dialog');
        ruta.className = 'ljuslada';
        ruta.setAttribute('aria-label', 'Förstorad bild');
        ruta.innerHTML =
            '<div class="ljuslada-topp">' +
                '<span class="ljuslada-raknare" aria-live="polite"></span>' +
                '<button type="button" data-stang>Stäng ✕</button>' +
            '</div>' +
            '<figure><img alt=""><figcaption></figcaption></figure>' +
            '<div class="ljuslada-nav">' +
                '<button type="button" data-steg="-1">‹ Föregående</button>' +
                '<button type="button" data-steg="1">Nästa ›</button>' +
            '</div>';
        document.body.appendChild(ruta);

        var storBild = ruta.querySelector('img');
        var bildtext = ruta.querySelector('figcaption');
        var raknare = ruta.querySelector('.ljuslada-raknare');
        var lista = forstoraLankar;
        var aktuell = 0;
        var oppnadFran = null;

        function visa(index) {
            aktuell = (index + lista.length) % lista.length;
            var lank = lista[aktuell];
            var liten = lank.querySelector('img');
            var text = liten ? liten.getAttribute('alt') : '';
            storBild.src = lank.getAttribute('href');
            storBild.alt = text;
            bildtext.textContent = text;
            raknare.textContent = 'Bild ' + (aktuell + 1) + ' av ' + lista.length;
        }

        forstoraLankar.forEach(function (lank) {
            lank.addEventListener('click', function (e) {
                e.preventDefault();
                var album = lank.closest('[data-album]');
                lista = album
                    ? Array.prototype.slice.call(album.querySelectorAll('a[data-forstora]'))
                    : forstoraLankar;
                oppnadFran = lank;
                visa(lista.indexOf(lank));
                document.documentElement.classList.add('ljuslada-oppen');
                ruta.showModal();
            });
        });

        ruta.addEventListener('close', function () {
            document.documentElement.classList.remove('ljuslada-oppen');
            storBild.removeAttribute('src');
            if (oppnadFran) oppnadFran.focus();
        });

        ruta.addEventListener('click', function (e) {
            var steg = e.target.closest('[data-steg]');
            if (steg) { visa(aktuell + parseInt(steg.getAttribute('data-steg'), 10)); return; }
            if (e.target.closest('[data-stang]') || e.target === ruta) ruta.close();
        });

        ruta.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); visa(aktuell + 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); visa(aktuell - 1); }
        });

        var startX = null;
        ruta.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        ruta.addEventListener('touchend', function (e) {
            if (startX === null) return;
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) visa(aktuell + (dx < 0 ? 1 : -1));
            startX = null;
        });
    }

    /* ---------- 4. Kartan ---------- */
    document.querySelectorAll('[data-karta]').forEach(function (knapp) {
        knapp.addEventListener('click', function () {
            var behallare = knapp.closest('.karta');
            var iframe = document.createElement('iframe');
            iframe.src = knapp.getAttribute('data-karta');
            iframe.title = 'Karta över Boggbergets festplats i Evertsberg, Älvdalen';
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            behallare.innerHTML = '';
            behallare.appendChild(iframe);
        });
    });
})();
