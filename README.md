# Portfolio – Nikola Vojvodić

Statički sajt bez build koraka, objavljen na **https://vojvodixdev.github.io**.

```
index.html                 portfolio (stilovi i skripte su u fajlu)
img/                       slike projekata
cv/Nikola_Vojvodic_CV.pdf  CV za dugmad "CV" (zameni fajl istim imenom kad ga ažuriraš)
```

## Projekti

Svaki projekat ima svoj repozitorijum i svoj sajt na GitHub Pages, koji se sam ažurira posle svakog `git push`. Portfolio samo linkuje na njih:

| Projekat | Live | Kod |
|---|---|---|
| FlakeRadar | https://vojvodixdev.github.io/flakeradar/ | https://github.com/vojvodixdev/flakeradar |
| Knjigoteka | https://vojvodixdev.github.io/knjigoteka/ | https://github.com/vojvodixdev/knjigoteka |
| Last Ember | https://vojvodixdev.github.io/last-ember/ | https://github.com/vojvodixdev/last-ember |

Kad menjaš neki projekat, menjaš ga u njegovom repozitorijumu. Ovde treba nešto promeniti samo ako se promeni opis projekta ili slika.

## Objavljivanje

Repozitorijum se zove `vojvodixdev.github.io`, a sajt se objavljuje iz grane `main` (Settings → Pages → Deploy from a branch → `main`, `/ (root)`). Posle `git push` sajt se osveži za minut-dva.

## Kontakt forma

Forma šalje poruke preko Formspree-a (`https://formspree.io/f/mppqglyp`). Poruke stižu na mejl kojim si napravio Formspree nalog. Prvu poruku sa novog domena Formspree može tražiti da potvrdiš.

## Kako da menjaš

- Srpski tekst je direktno u `index.html`, engleski prevod je u objektu `EN` u skripti na dnu fajla. Sadržaj prozora `nikola.js` je u objektu `CODE`.
- Projekti i alati su u `index.html`.
- Boje tamne teme su u `:root`, svetle u `:root[data-mode="light"]` na vrhu `<style>`.
- Novi projekat: kopiraj jedan `<article class="proj">` blok, dodaj slike u `img/` (desktop 1600×1000, telefon 500×1082, format `.webp`) i upiši linkove ka sajtu i repozitorijumu. Projekti se smenjuju levo-desno: svaki drugi `<article>` ima klasu `flip`.
- U tabeli alata (`TOOLS` u skripti) slova u poslednjoj koloni govore u kom projektu se alat vidi: F = FlakeRadar, K = Knjigoteka, L = Last Ember.
