# Instrukcja obsługi strony dla Krzysztofa

Cześć Krzysztof! Poniżej znajdziesz prosty przewodnik, jak zarządzać pracami Karoliny (obrazami, aranżacjami i dyplomami) oraz jak publikować zmiany w internecie.

Do dyspozycji masz **wygodny panel wizualny**, dzięki któremu wszystkie operacje wykonasz w przeglądarce za pomocą kliknięć – bez konieczności ręcznego edytowania kodu.

---

## 1. Pierwsze uruchomienie (jednorazowo)

1. Upewnij się, że masz zainstalowane środowisko [Node.js](https://nodejs.org/) (wersja 20 lub nowsza).
2. Otwórz terminal w folderze projektu i zainstaluj zależności:
   ```bash
   npm install
   ```
3. W głównym folderze projektu utwórz plik o nazwie `.env` i wklej do niego otrzymane dane dostępowe:
   ```env
   CLOUDFLARE_API_TOKEN=twoj_token_api
   CLOUDFLARE_ACCOUNT_ID=twoje_account_id
   ```
   *(Plik `.env` jest ukryty i chroniony – Twoje klucze nie trafią do internetu).*

---

## 2. Codzienna praca – uruchomienie panelu

Wpisz w terminalu polecenie:

```bash
npm run panel
```

Otwórz w przeglądarce adres: 👉 **http://localhost:3000**

---

## 3. Jak wykonywać operacje w panelu

### 🖼️ Dodawanie nowych prac (obrazów, dyplomów, aranżacji)
1. W górnym menu wybierz odpowiednią kategorię: **Obrazy**, **Aranżacje** lub **Dyplomy**.
2. Kliknij zielony przycisk **„+ Dodaj nową pracę”**.
3. Wgraj plik graficzny (JPG, PNG, WebP) – zobaczysz od razu podgląd miniatury.
   *System sam nada kolejny numer plikowi (np. `obraz-160.jpg`) i zoptymalizuje go pod stronę.*
4. Wpisz dane: **Tytuł**, **Technikę** (możesz wybrać z listy podpowiedzi), **Wymiary**, **Rok** i opcjonalny **Opis**.
5. Kliknij **„Zapisz i dodaj”**.

---

### ✏️ Edycja opisów i danych prac
1. Znajdź pracę na liście (możesz użyć wyszukiwarki u góry wpisując np. tytuł lub rok).
2. Kliknij niebieską ikonę **ołówka (Edytuj)** po prawej stronie karty.
3. Zmień dowolne pole (tytuł, wymiary, technikę, opis lub widoczność: wyróżniony / ukryty).
4. Kliknij **„Zapisz zmiany”**.

---

### ↕️ Zmiana kolejności prac w galerii
> **Zasada:** Pozycja **#1** na samej górze w panelu to praca, która wyświetla się jako **pierwsza w galerii** na stronie.

Kolejność możesz zmienić na dwa sposoby:
- **Przeciągając kartę myszką:** Chwyć za ikonę kropek `⋮⋮` po lewej stronie i upuść w wybranym miejscu.
- **Za pomocą przycisków:**
  - `⇈` – przenieś na samą górę galerii (pozycja #1),
  - `↑` – przesuń o 1 pozycję wyżej,
  - `↓` – przesuń o 1 pozycję niżej,
  - `⇊` – przenieś na sam dół galerii.

*Zmiana kolejności zapisuje się automatycznie natychmiast po przesunięciu.*

---

### 👁️ Podgląd strony przed publikacją
Zanim wyślesz zmiany do internetu, możesz zobaczyć, jak wygląda strona:
1. W prawym górnym rogu panelu kliknij przycisk **„Podgląd”**.
2. Kliknij **„Uruchom podgląd”** i przejdź pod adres **http://localhost:4321**.
3. Gdy skończysz oglądać, możesz zatrzymać serwer przyciskiem **„Zatrzymaj”**.

---

### 🚀 Kompilacja i publikacja do Cloudflare
Gdy wszystko jest gotowe i chcesz, aby zmiany pojawiły się na żywej stronie:
1. W prawym górnym rogu panelu kliknij żółty przycisk **„Publikuj”**.
2. Kliknij **„Rozpocznij publikację teraz”**.
3. Program automatycznie:
   - Zbuduje zoptymalizowaną stronę (`astro build`),
   - Prześle pliki na Cloudflare Pages (`wrangler pages deploy`).
4. Po kilkunastu sekundach zobaczysz zielony komunikat sukcesu – strona jest zaktualizowana!

*(Alternatywnie publikację możesz uruchomić z terminala poleceniem: `npm run deploy`).*

---

## 4. Podsumowanie skrótów poleceń

| Polecenie | Co robi |
|---|---|
| `npm run panel` | Uruchamia panel zarządzania pracami (**http://localhost:3000**) |
| `npm run dev` | Uruchamia lokalny podgląd strony (**http://localhost:4321**) |
| `npm run deploy` | Buduje stronę i publikuje ją na Cloudflare Pages |
