# Portfolio – Nikola Vojvodić

Statički sajt bez build koraka. Sve je u ovom folderu:

```
index.html                 portfolio (stilovi i skripte su u fajlu)
img/                       slike projekata
projekti/flakeradar/       FlakeRadar demo uživo (statička verzija sa primerima podataka)
projekti/knjigoteka/       Knjigoteka uživo (dugme "Live pregled")
projekti/last-ember/       Last Ember uživo
preuzimanje/*.zip          izvorni kod za dugme "Preuzmi kod"
cv/Nikola_Vojvodic_CV.pdf  CV za dugmad "CV" (zameni fajl istim imenom kad ga ažuriraš)
```

## Objavljivanje

Sajt nema build korak: ceo sadržaj ovog foldera samo se postavi na hosting (preko panela hostinga ili FTP-a), tako da `index.html` bude u korenu domena. Folderi `projekti/`, `img/`, `preuzimanje/` i `cv/` moraju ostati pored njega.

## Kontakt forma

Forma šalje poruke preko Formspree-a (`https://formspree.io/f/mppqglyp`). Poruke stižu na mejl kojim si napravio Formspree nalog. Prvu poruku sa novog domena Formspree može tražiti da potvrdiš.

## Kako da menjaš

- Srpski tekst je direktno u `index.html`, engleski prevod je u objektu `EN` u skripti na dnu fajla. Sadržaj prozora `nikola.js` je u objektu `CODE`.
- Projekti i alati su u `index.html`.
- Boje tamne teme su u `:root`, svetle u `:root[data-mode="light"]` na vrhu `<style>`.
- Novi projekat: kopiraj jedan `<article class="proj">` blok, ubaci folder u `projekti/` i zip u `preuzimanje/`. Projekti se smenjuju levo-desno: svaki drugi `<article>` ima klasu `flip`.
- U tabeli alata (`TOOLS` u skripti) slova u poslednjoj koloni govore u kom projektu se alat vidi: F = FlakeRadar, K = Knjigoteka, L = Last Ember.
- Kad menjaš Knjigoteku, povećaj `VERSION` u `projekti/knjigoteka/sw.js` da instalirane kopije dobiju novu verziju.

## Napomena za FlakeRadar

Pravi FlakeRadar ima server i bazu, a ovde je statička demo verzija koja radi bez servera i čak kad se otvori dvoklikom: podaci iz demo projekata su ugrađeni u JavaScript, a datumi se pri otvaranju pomeraju tako da uvek izgledaju sveže. Dugme „Kod na GitHubu” vodi na repozitorijum.

Kad promeniš FlakeRadar, novu demo verziju napraviš u folderu FlakeRadar projekta:

```bash
npm run build:demo
```

i sadržaj foldera `apps/web/dist-demo/` iskopiraš u `projekti/flakeradar/` (stari sadržaj prvo obriši).

## Napomena za Knjigoteku

Kopija u `projekti/knjigoteka/` je spakovana tako da radi i kad se sajt otvori dvoklikom na `index.html`: svi JavaScript moduli su spojeni u `js/app.bundle.js`, a fontovi su ugrađeni u `css/app.css`. Originalni kod sa modulima je u `preuzimanje/knjigoteka.zip`. Kad menjaš Knjigoteku, ponovo napravi bundle:

```bash
npx esbuild js/app.js --bundle --format=iife --target=es2020 --outfile=js/app.bundle.js
```
