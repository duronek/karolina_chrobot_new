# Karolina Chrobot – strona artystki

Strona zbudowana w [Astro](https://astro.build), hostowana na Cloudflare Pages.

## Uruchomienie

```bash
npm install
npm run dev       # podgląd na żywo: http://localhost:4321
npm run build     # wersja produkcyjna do folderu dist/
npm run preview   # podgląd zbudowanej wersji
```

## Jak dodać nowy obraz, aranżację lub dyplom

### Najprościej: panel Pages CMS

1. Wejdź na https://app.pagescms.org i zaloguj się kontem GitHub
   (konto musi mieć dostęp do repozytorium `duronek/karolina_chrobot`).
2. Wybierz repozytorium, a w menu: **Obrazy**, **Aranżacje** albo **Dyplomy**.
3. Na **końcu listy** dodaj nową pozycję, wgraj zdjęcie, wpisz tytuł i technikę.
4. Zapisz (**Save**). Po ok. minucie praca pojawi się na stronie – jako pierwsza w galerii.

W panelu można też poprawić opis, zmienić kolejność (przeciągając pozycje),
zaznaczyć **Wyróżniony** (ramka „Kobieta” na Stronie Głównej) albo **Ukryty**.

> Lista jest chronologiczna: **ostatnia pozycja na liście = pierwsza w galerii**.

Konfiguracja panelu jest w pliku `.pages.yml`.

### Ręcznie (bez panelu)

| Zdjęcia                 | Lista prac               | Gdzie się pokazuje       |
| ----------------------- | ------------------------ | ------------------------ |
| `src/tresci/obrazy/`    | `src/dane/obrazy.yml`    | Galeria → Obrazy         |
| `src/tresci/aranzacje/` | `src/dane/aranzacje.yml` | Galeria → Aranżacje      |
| `src/tresci/dyplomy/`   | `src/dane/dyplomy.yml`   | O mnie → Dyplomy/Nagrody |
| `src/tresci/zdjecia/`   | –                        | Strona Główna, O mnie    |

1. Wrzuć zdjęcie do folderu (dowolna nazwa, najlepiej bez spacji i polskich znaków).
2. Dopisz je **na końcu** odpowiedniej listy w `src/dane/`:

   ```yaml
   - zdjecie: /src/tresci/obrazy/sloneczniki.jpg
     tytul: Słoneczniki
     technika: olej na płótnie
     wymiary: 40 × 50 cm
     rok: 2026
     opis: Krótki opis widoczny w powiększeniu.
     wyrozniony: true   # opcjonalnie – ramka „Kobieta” na Stronie Głównej
     ukryty: true       # opcjonalnie – nie pokazuj na stronie
   ```

   Wymagane jest tylko `zdjecie`. Zdjęcie bez wpisu na liście **nie pojawi się** na stronie
   (build wypisze ostrzeżenie).

3. Wyślij zmiany do repozytorium (commit + push) – Cloudflare Pages sam zbuduje
   i opublikuje stronę w ciągu ok. minuty.

Nie trzeba robić miniatur ani zmniejszać zdjęć – strona sama przygotuje
lekkie wersje (WebP) w kilku rozmiarach. Obsługiwane formaty: JPG, PNG, WebP, AVIF.

## Ustawienia Cloudflare

Strona jest wdrażana jako Worker `karolina-chrobot-new` (konfiguracja w `wrangler.jsonc`):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Zmienna buildu: `NODE_VERSION = 22.23.4` (lub nowsza – wymóg Astro 7; ta sama wersja jest w `.nvmrc`)

Przy wdrożeniu jako projekt Cloudflare Pages: Build command `npm run build`,
Build output directory `dist`, bez Deploy command.

Stare adresy (`gallery.html`, `aboutme.html`) są przekierowywane na nowe przez `public/_redirects`.

## Bezpośrednie linki do prac

Każda praca ma własny adres, np. `/galeria/#obraz-150` albo `/galeria/aranzacje/#aranzacja-012` –
po otwarciu linku od razu pokazuje się powiększenie. Adres można skopiować z paska przeglądarki
podczas oglądania pracy.
