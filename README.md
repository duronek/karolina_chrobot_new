# Karolina Chrobot – strona artystki

Strona internetowa artystki zbudowana w oparciu o [Astro](https://astro.build) i publikowana na platformie Cloudflare Pages za pomocą narzędzia **Wrangler**.

---

## Spis treści

- [Panel zarządzania (Lokalna aplikacja WWW)](#panel-zarządzania-lokalna-aplikacja-www)
- [Uruchomienie lokalne strony](#uruchomienie-lokalne-strony)
- [Zarządzanie treścią (obrazy, aranżacje, dyplomy)](#zarządzanie-treścią-obrazy-aranżacje-dyplomy)
  - [Struktura plików](#struktura-plików)
  - [Jak dodać nowy obraz, aranżację lub dyplom](#jak-dodać-nowy-obraz-aranżację-lub-dyplom)
  - [Jak zmieniać opisy prac](#jak-zmieniać-opisy-prac)
  - [Jak zmieniać kolejność prac w galerii](#jak-zmieniać-kolejność-prac-w-galerii)
- [Publikacja na Cloudflare (Wrangler)](#publikacja-na-cloudflare-wrangler)
  - [1. Jednorazowe logowanie](#1-jednorazowe-logowanie)
  - [2. Publikacja jednym poleceniem](#2-publikacja-jednym-poleceniem)
  - [3. Krok po kroku](#3-krok-po-kroku)
- [Bezpośrednie linki do prac](#bezpośrednie-linki-do-prac)

---

## Panel zarządzania (Lokalna aplikacja WWW)

W folderze `panel/` znajduje się dedykowana aplikacja **Node.js + Express** z graficznym interfejsem użytkownika, która ułatwia:
- Dodawanie nowych prac z uploadem plików graficznych i automatycznym nadawaniem nazw,
- Zmianę kolejności zdjęć metodą przeciągnij i upuść (Drag & Drop) lub przyciskami ze strzałkami,
- Edycję tytułów, techniki, wymiarów, roku i opisów,
- Usuwanie prac i powiązanych plików z dysku,
- Podgląd strony w Astro Dev (`http://localhost:4321`) jednym kliknięciem,
- Bezpośrednią publikację na Cloudflare Pages (`npm run deploy`) z podglądem logów.

**Uruchomienie panelu:**
```bash
npm run panel
```
Aplikacja uruchomi się pod adresem: **http://localhost:3000**  
Więcej szczegółów w pliku [panel/README.md](file:///f:/_NODE_PROJECTS_/KarolinaChrobot_new/panel/README.md).

---

## Uruchomienie lokalne strony

```bash
npm install       # instalacja zależności (po sklonowaniu repozytorium)
npm run dev       # uruchomienie serwera developerskiego (http://localhost:4321)
npm run build     # zbudowanie wersji produkcyjnej do folderu dist/
npm run preview   # lokalny podgląd zbudowanej wersji produkcyjnej
```

---

## Zarządzanie treścią (obrazy, aranżacje, dyplomy)

Wszystkie treści strony są zdefiniowane w plikach wewnątrz katalogu `src/`. Zdjęcia znajdują się w `src/tresci/`, a ich metadane (tytuły, technika, wymiary, rok, opis, kolejność) w plikach YAML w `src/dane/`.

### Struktura plików

| Kategoria               | Folder na zdjęcia         | Plik z listą prac        | Gdzie jest widoczne na stronie |
| ----------------------- | ------------------------- | ------------------------ | ------------------------------ |
| **Obrazy**              | `src/tresci/obrazy/`      | `src/dane/obrazy.yml`    | **Galeria → Obrazy**           |
| **Aranżacje**           | `src/tresci/aranzacje/`   | `src/dane/aranzacje.yml` | **Galeria → Aranżacje**        |
| **Dyplomy i nagrody**   | `src/tresci/dyplomy/`     | `src/dane/dyplomy.yml`   | **O mnie → Dyplomy / Wystawy** |
| **Zdjęcia wizerunkowe** | `src/tresci/zdjecia/`     | –                        | Strona Główna, O mnie          |

> **Formaty zdjęć:** Obsługiwane są formaty: JPG, PNG, WebP, AVIF.  
> Astro automatycznie generuje responsywne, zoptymalizowane miniatury WebP w kilku rozdzielczościach, więc nie trzeba ręcznie skalować plików przed dodaniem. Zaleca się stosowanie nazw plików bez spacji i polskich znaków diakrytycznych (np. `obraz-160.jpg` lub `sloneczniki.jpg`).

---

### Jak dodać nowy obraz, aranżację lub dyplom

1. **Wgraj plik ze zdjęciem** do właściwego katalogu:
   - dla obrazu: do `src/tresci/obrazy/`
   - dla aranżacji: do `src/tresci/aranzacje/`
   - dla dyplomu: do `src/tresci/dyplomy/`

2. **Dopisz wpis na końcu odpowiedniego pliku YAML** (`src/dane/obrazy.yml`, `src/dane/aranzacje.yml` lub `src/dane/dyplomy.yml`):

   ```yaml
   - zdjecie: /src/tresci/obrazy/nazwa-pliku.jpg
     tytul: Tytuł obrazu
     technika: olej na płótnie
     wymiary: 50 × 70 cm
     rok: 2026
     opis: Opcjonalny opis widoczny w powiększeniu pracy.
     wyrozniony: true   # opcjonalnie: wyróżnienie pracy na Stronie Głównej
     ukryty: false      # opcjonalnie: ustaw true, aby ukryć pozycję bez usuwania
   ```

   **Dostępne pola:**
   - `zdjecie` (**wymagane**) – ścieżka do pliku zaczynająca się od `/src/tresci/...`
   - `tytul` – tytuł pracy
   - `technika` – technika wykonania (np. `olej na płótnie`, `akwarela na papierze`)
   - `wymiary` – wymiary w formacie np. `40 × 50 cm`
   - `rok` – rok powstania (np. `2026`)
   - `opis` – rozwinięty opis wyświetlany w modalu powiększenia (PhotoSwipe)
   - `wyrozniony: true` – wyświetla pracę w sekcji wyróżnionej na Stronie Głównej
   - `ukryty: true` – ukrywa pracę w galerii, pozostawiając ją w pliku konfiguracyjnym

> [!IMPORTANT]
> Zdjęcie umieszczone w folderze, które **nie zostanie dopisane** do odpowiedniego pliku `.yml`, nie pojawi się na stronie (proces budowania zgłosi ostrzeżenie w konsoli).

---

### Jak zmieniać opisy prac

1. Otwórz plik `src/dane/obrazy.yml`, `src/dane/aranzacje.yml` lub `src/dane/dyplomy.yml`.
2. Odszukaj wpis danej pracy (np. po nazwie pliku w polu `zdjecie` lub po aktualnym `tytul`).
3. Zmień dowolne pole: `tytul`, `technika`, `wymiary`, `rok`, `opis` lub flagi `wyrozniony` / `ukryty`.
4. Zapisz plik.

---

### Jak zmieniać kolejność prac w galerii

Zasada wyświetlania jest chronologiczna – najnowsze pozycje pojawiają się na samej górze:

> **Ostatnia pozycja na liście w pliku YAML = PIERWSZA pozycja wyświetlana w galerii.**  
> **Pierwsza pozycja na liście w pliku YAML = OSTATNIA pozycja na dole galerii.**

- **Chcesz, aby praca była na samym początku galerii?**  
  Przenieś cały jej blok YAML na **sam koniec** pliku `.yml`.
- **Chcesz przesunąć pracę dalej/niżej w galerii?**  
  Przenieś jej blok w pliku `.yml` wyżej (w stronę początku pliku).
- **Chcesz zamienić miejscami dwa obrazy?**  
  Zamień kolejność ich bloków w pliku `.yml`.

---

## Publikacja na Cloudflare (Wrangler)

Do publikacji strony służy oficjalne narzędzie [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/).  
Konfiguracja wdrożenia znajduje się w pliku `wrangler.jsonc` (projekt `karolina-chrobot`, katalog wyjściowy `./dist`).

### 1. Jednorazowe logowanie

Przed pierwszym wdrożeniem z poziomu terminala należy zalogować się do swojego konta Cloudflare:

```bash
npx wrangler login
```

Polecenie otworzy kartę w przeglądarce, gdzie wystarczy zatwierdzić dostęp do konta Cloudflare.

### 2. Publikacja jednym poleceniem

Aby zbudować stronę i od razu wysłać ją na Cloudflare Pages:

```bash
npm run deploy
```

Skrypt ten wykonuje automatycznie:
1. `astro build` – buduje zoptymalizowaną stronę do katalogu `dist/`
2. `wrangler pages deploy` – publikuje zawartość katalogu produkcyjnego na Cloudflare Pages

### 3. Krok po kroku

Możesz także wykonać te kroki oddzielnie:

```bash
# 1. Zbuduj stronę do folderu dist/
npm run build

# 2. Opublikuj na Cloudflare Pages
npx wrangler pages deploy
```

Po zakończeniu przesyłania Wrangler wyświetli w terminalu adres URL wdrożenia oraz potwierdzenie sukcesu.

---

## Bezpośrednie linki do prac

Każda praca w galerii posiada unikalny identyfikator kotwicy (hash URL) utworzony z nazwy pliku, np.:
- Obrazy: `/galeria/#obraz-150`
- Aranżacje: `/galeria/aranzacje/#aranzacja-012`

Wejście na taki adres powoduje automatyczne otwarcie powiększenia (lightbox) danej pracy z jej pełnym opisem. Link można skopiować bezpośrednio z paska przeglądarki podczas przeglądania powiększenia.
