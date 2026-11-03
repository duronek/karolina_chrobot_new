# Panel Administracyjny – Karolina Chrobot

Lokalna aplikacja webowa w technologii **Node.js + Express**, stworzona do wygodnego zarządzania zawartością galerii (obrazami, aranżacjami i dyplomami) oraz automatyzacji wdrożeń strony Karoliny Chrobot.

Aplikacja operuje bezpośrednio na plikach projektu:
- Metadane prac: `src/dane/obrazy.yml`, `src/dane/aranzacje.yml`, `src/dane/dyplomy.yml`
- Pliki graficzne: `src/tresci/obrazy/`, `src/tresci/aranzacje/`, `src/tresci/dyplomy/`

---

## Szybkie uruchomienie

Możesz uruchomić panel na dwa sposoby:

### Sposób 1: Z głównego katalogu projektu (zalecany)

```bash
npm run panel
```

### Sposób 2: Z poziomu folderu `panel`

```bash
cd panel
npm start
```

Po uruchomieniu otwórz przeglądarkę pod adresem:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## Główne funkcjonalności

### 1. Przeglądanie i filtrowanie prac
- Przełączanie kategorii prac w nagłówku (**Obrazy**, **Aranżacje**, **Dyplomy**).
- Szybka wyszukiwarka po tytule, technice, wymiarach, roku lub nazwie pliku.
- Wyświetlanie miniatur zdjęć, tytułów, techniki, wymiarów oraz statusów (**Wyróżniony na Głównej**, **Ukryty**).
- Kliknięcie miniaturki otwiera zdjęcie w pełnym rozmiarze w nowej karcie.

### 2. Dodawanie nowej pracy
- Przycisk **„Dodaj nową pracę”** otwiera intuicyjny formularz z wbudowanym podglądem wybranego pliku graficznego.
- Obsługa plików: **JPG, PNG, WebP, AVIF**.
- Aplikacja automatycznie nadaje plikowi kolejny unikalny numer (np. `obraz-160.jpg`) i zapisuje go w folderze `src/tresci/<kategoria>/`.
- Uzupełnianie pól: tytuł, technika (z listą podpowiedzi najczęstszych technik), wymiary, rok, opis, oznaczenie „Wyróżniony”, „Ukryty”.
- Możliwość wyboru, czy nowa praca ma trafić na początek galerii (najnowsza - domyślnie), czy na koniec.

### 3. Zmiana kolejności prac w galerii
- **Zgodność z logiką strony:** Pozycja **#1** na liście w panelu to praca, która wyświetla się na samej górze galerii na stronie.
- Prace można przestawiać na dwa sposoby:
  - **Przeciągając myszką (Drag & Drop)** za uchwyt po lewej stronie.
  - **Przyciskami nawigacyjnymi**:
    - `⇈` (Przenieś na samą górę galerii)
    - `↑` (Przesuń o jedną pozycję w górę)
    - `↓` (Przesuń o jedną pozycję w dół)
    - `⇊` (Przenieś na sam dół galerii)
- Zmiana kolejności jest natychmiast zapisywana do odpowiedniego pliku YAML z uwzględnieniem odwróconej chronologii.

### 4. Edycja metadanych
- Przycisk z ołówkiem otwiera formularz edycji istniejącej pracy.
- Umożliwia zmianę tytułu, techniki, wymiarów, roku, opisu oraz flag widoczności bez konieczności ponownego wgrywania pliku.

### 5. Usuwanie prac
- Przycisk z koszem pozwala usunąć pracę z galerii (z pliku YAML).
- Opcjonalny checkbox pozwala zdecydować, czy usunąć również fizyczny plik graficzny z dysku.

### 6. Podgląd lokalny strony (Astro Dev)
- Przycisk **„Podgląd”** w nagłówku pozwala jednym kliknięciem:
  - Uruchomić lokalny serwer deweloperski Astro (`npm run dev`).
  - Sprawdzić stan działania serwera (zielona kontrolka informuje o aktywności).
  - Otworzyć stronę w nowej karcie pod adresem `http://localhost:4321`.
  - Przeglądać logi kompilacji w czasie rzeczywistym.
  - Zatrzymać serwer podglądu.

### 7. Publikacja na Cloudflare (Deploy)
- Przycisk **„Publikuj”** w nagłówku uruchamia polecenie:
  ```bash
  npm run deploy
  ```
- W oknie modalu wyświetlany jest postęp kompilacji (`astro build`) oraz wdrożenia (`wrangler pages deploy`).
- Po pomyślnym zakończeniu wyświetlane jest potwierdzenie i czas trwania wdrożenia.

---

## Struktura plików panelu

```
panel/
├── package.json          # Zależności i skrypty panelu (express, multer, yaml)
├── README.md             # Niniejsza instrukcja
├── server.js             # Główny serwer Express i punkty końcowe API
├── lib/
│   ├── dataManager.js    # Fabryka do obsługi plików YAML i manipulacji zdjęciami
│   └── processRunner.js  # Fabryka zarządzająca procesami (Astro dev, Wrangler deploy)
└── public/
    ├── index.html        # Interfejs SPA (Bootstrap 5, FontAwesome)
    ├── css/
    │   └── style.css     # Style interfejsu oparte wyłącznie o Flexbox (brak CSS Grid)
    └── js/
        └── app.js        # Logika frontendowa (Vanilla JS, wzorzec Factory Function)
```

---

## Architektura i wytyczne projektowe

- **Backend:** Node.js, Express, Multer (zarządzanie uploadem), `yaml` (odczyt i zapis konfiguracji).
- **Frontend:** Vanilla JavaScript (ES Modules), Bootstrap 5, FontAwesome 6.
- **Wzorce programistyczne:**
  - Zastosowanie wzorca **Factory Function** zamiast klas.
  - Wykorzystanie **Immutable Objects** poprzez `Object.freeze()`.
  - Stosowanie wyłącznie funkcji strzałkowych (`() => {}`) oraz deklaracji `const` i `let`.
  - Układ strony oparty w 100% o **CSS Flexbox** (brak `display: grid`).

