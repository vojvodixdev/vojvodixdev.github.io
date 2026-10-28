# Portfolio – Nikola Vojvodić

Statički sajt bez build koraka, objavljen na **https://vojvodixdev.github.io**.

```
index.html                 struktura stranice (HTML) i meta tagovi za pregled linka
css/style.css              svi stilovi, obe teme
js/main.js                 sva logika: prevodi, editor, paleta, tema, animacije, forma
img/                       slike projekata, fotografija i og.jpg (slika za pregled linka)
cv/Nikola_Vojvodic_CV.pdf  CV za dugmad "CV" (zameni fajl istim imenom kad ga ažuriraš)
```

## Projekti

Svaki projekat ima svoj repozitorijum i svoj sajt na GitHub Pages, koji se sam ažurira posle svakog `git push`. Portfolio samo linkuje na njih:

| Projekat | Live | Kod |
|---|---|---|
| FlakeRadar | https://vojvodixdev.github.io/flakeradar/ | https://github.com/vojvodixdev/flakeradar |
| Knjigoteka | https://vojvodixdev.github.io/knjigoteka/ | https://github.com/vojvodixdev/knjigoteka |
| Last Ember | https://vojvodixdev.github.io/last-ember/ | https://github.com/vojvodixdev/last-ember |
| Morrow | https://vojvodixdev.github.io/morrow/ | https://github.com/vojvodixdev/morrow |

Kad menjaš neki projekat, menjaš ga u njegovom repozitorijumu. Ovde treba nešto promeniti samo ako se promeni opis projekta ili slika.

## Objavljivanje

Repozitorijum se zove `vojvodixdev.github.io`, a sajt se objavljuje iz grane `main` (Settings → Pages → Deploy from a branch → `main`, `/ (root)`). Posle `git push` sajt se osveži za minut-dva.

## Kontakt forma

Forma šalje poruke preko Formspree-a (`https://formspree.io/f/mppqglyp`). Poruke stižu na mejl kojim si napravio Formspree nalog. Prvu poruku sa novog domena Formspree može tražiti da potvrdiš.

## Kako da menjaš

- Srpski tekst je direktno u `index.html`, engleski prevod je u objektu `EN` u `js/main.js`. Sadržaj editora (`nikola.js`, `projects.json`, `README.md`) je u objektu `FILES` u `js/main.js`.
- Projekti su u `index.html`, a lista alata je u nizu `TOOLS` u `js/main.js`.
- Boje tamne teme su u `:root`, svetle u `:root[data-mode="light"]` na vrhu `css/style.css`.
- Novi projekat: kopiraj jedan `<article class="proj">` blok, dodaj slike u `img/` (desktop 1600×1000, telefon 500×1082, format `.webp`) i upiši linkove ka sajtu i repozitorijumu. Projekti se smenjuju levo-desno: svaki drugi `<article>` ima klasu `flip`.
- Svaki alat u `TOOLS` ima polje `used` sa slovima projekata u kojima se vidi: F = FlakeRadar, K = Knjigoteka, L = Last Ember, M = Morrow. Glavni alati imaju `area: "core"`.

## License

© 2026 Nikola Vojvodić. All rights reserved. The code is public so it can be read and evaluated as part of my portfolio; it is not open source. See [LICENSE](LICENSE) for what is and isn't allowed.
