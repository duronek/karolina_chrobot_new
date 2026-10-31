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

Wszystkie zdjęcia leżą w folderze `src/tresci/`:

| Folder                    | Co zawiera                  | Gdzie się pokazuje           |
| ------------------------- | --------------------------- | ---------------------------- |
| `src/tresci/obrazy/`      | obrazy                      | Galeria → Obrazy             |
| `src/tresci/aranzacje/`   | obrazy we wnętrzach         | Galeria → Aranżacje          |
| `src/tresci/dyplomy/`     | dyplomy i nagrody           | O mnie → Dyplomy/Nagrody     |
| `src/tresci/zdjecia/`     | zdjęcia Karoliny            | Strona Główna, O mnie        |

### 1. Wrzuć plik do folderu

Nazwij go **kolejnym numerem** – najwyższy numer wyświetla się jako pierwszy:

- obraz → `obraz-160.jpg`, `obraz-161.jpg`, …
- aranżacja → `aranzacja-038.jpg`, …
- dyplom → `dyplom-047.jpg`, …

Nie trzeba robić miniatur ani zmniejszać zdjęć – strona sama przygotuje
lekkie wersje (WebP) w kilku rozmiarach. Obsługiwane formaty: JPG, PNG, WebP, AVIF.

### 2. (Opcjonalnie) dodaj opis

W tym samym folderze jest plik `opisy.yml`. Dopisz wpis z nazwą pliku:

```yaml
obraz-160.jpg:
  tytul: Słoneczniki
  technika: olej na płótnie
  wymiary: 40 × 50 cm
  rok: 2026
  opis: Krótki opis widoczny w powiększeniu.
```

Wszystkie pola są opcjonalne. Dodatkowo:

- `wyrozniony: true` – obraz pojawi się w zmieniającej się ramce „Kobieta” na Stronie Głównej,
- `ukryty: true` – obraz zniknie ze strony, ale plik zostanie w folderze.

### 3. Opublikuj

Wyślij zmiany do repozytorium (`git add . && git commit -m "Nowy obraz" && git push`) –
Cloudflare Pages sam zbuduje i opublikuje stronę w ciągu ok. minuty.

## Ustawienia Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Zmienna środowiskowa: `NODE_VERSION = 22.23.4` (lub nowsza – wymóg Astro 7; ta sama wersja jest w `.nvmrc`)

Stare adresy (`gallery.html`, `aboutme.html`) są przekierowywane na nowe przez `public/_redirects`.

## Bezpośrednie linki do prac

Każda praca ma własny adres, np. `/galeria/#obraz-150` albo `/galeria/aranzacje/#aranzacja-012` –
po otwarciu linku od razu pokazuje się powiększenie. Adres można skopiować z paska przeglądarki
podczas oglądania pracy.
