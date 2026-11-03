import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';

/**
 * Fabryka menedżera danych do obsługi plików YAML oraz plików graficznych.
 * @param {Object} config - Obiekt konfiguracyjny ze ścieżkami bazowymi
 */
export const createDataManager = (config) => {
  const rootDir = config.rootDir;
  const daneDir = path.join(rootDir, 'src', 'dane');
  const tresciDir = path.join(rootDir, 'src', 'tresci');

  const dozwoloneKategorie = ['obrazy', 'aranzacje', 'dyplomy'];

  const sprawdzKategorie = (kategoria) => {
    if (!dozwoloneKategorie.includes(kategoria)) {
      throw new Error(`Nieobsługiwana kategoria: ${kategoria}. Dozwolone: ${dozwoloneKategorie.join(', ')}`);
    }
  };

  const sciezkaYaml = (kategoria) => {
    sprawdzKategorie(kategoria);
    return path.join(daneDir, `${kategoria}.yml`);
  };

  const sciezkaKataloguTresci = (kategoria) => {
    sprawdzKategorie(kategoria);
    return path.join(tresciDir, kategoria);
  };

  /**
   * Odczytuje surową listę prac z pliku YAML (w kolejności chronologicznej: najstarsze na początku).
   */
  const odczytajZYaml = (kategoria) => {
    const plik = sciezkaYaml(kategoria);
    if (!fs.existsSync(plik)) {
      return [];
    }
    const raw = fs.readFileSync(plik, 'utf-8');
    const dane = parse(raw);
    return Array.isArray(dane) ? dane.filter((w) => w && typeof w.zdjecie === 'string') : [];
  };

  /**
   * Zapisuje listę prac do pliku YAML z zachowaniem nagłówka z komentarzem.
   */
  const zapiszDoYaml = (kategoria, listaPrac) => {
    const plik = sciezkaYaml(kategoria);
    const czystaLista = listaPrac.map((item) => {
      const wpis = { zdjecie: item.zdjecie };
      if (item.tytul) wpis.tytul = item.tytul;
      if (item.technika) wpis.technika = item.technika;
      if (item.wymiary) wpis.wymiary = item.wymiary;
      if (item.rok !== undefined && item.rok !== '') wpis.rok = isNaN(Number(item.rok)) ? item.rok : Number(item.rok);
      if (item.opis) wpis.opis = item.opis;
      if (item.wyrozniony) wpis.wyrozniony = true;
      if (item.ukryty) wpis.ukryty = true;
      return wpis;
    });

    const naglowek = `# Lista prac: ${kategoria}.\n# Kolejność chronologiczna: ostatnia pozycja wyświetla się na stronie jako pierwsza.\n`;
    const trescYaml = stringify(czystaLista, { indent: 2, lineWidth: 0 });
    fs.writeFileSync(plik, `${naglowek}${trescYaml}`, 'utf-8');
  };

  /**
   * Pobiera listę prac posortowaną tak, jak wyświetla się w galerii (od najnowszej do najstarszej).
   */
  const getPrace = (kategoria) => {
    const listaYaml = odczytajZYaml(kategoria);
    // Odwracamy kolejność, aby indeks 0 był pierwszą pracą wyświetlaną w galerii (na samej górze)
    const praceWGalerii = [...listaYaml].reverse().map((praca, indexWGalerii) => {
      const sciezkaWzgledna = praca.zdjecie.replace(/^\//, '');
      const pelnaSciezkaPliku = path.join(rootDir, sciezkaWzgledna);
      const plikIstnieje = fs.existsSync(pelnaSciezkaPliku);
      const nazwaPliku = path.basename(praca.zdjecie);

      return Object.freeze({
        id: nazwaPliku.replace(/\.[^.]+$/, ''),
        nazwaPliku,
        zdjecie: praca.zdjecie,
        tytul: praca.tytul || '',
        technika: praca.technika || '',
        wymiary: praca.wymiary || '',
        rok: praca.rok !== undefined ? String(praca.rok) : '',
        opis: praca.opis || '',
        wyrozniony: Boolean(praca.wyrozniony),
        ukryty: Boolean(praca.ukryty),
        plikIstnieje,
        indeksWGalerii: indexWGalerii + 1
      });
    });

    return Object.freeze(praceWGalerii);
  };

  /**
   * Generuje bezpieczną i unikalną nazwę pliku, np. obraz-160.jpg lub zachowuje rozszerzenie.
   */
  const generujUnikalnaNazwe = (kategoria, oryginalnaNazwa) => {
    const ext = path.extname(oryginalnaNazwa).toLowerCase() || '.jpg';
    const folder = sciezkaKataloguTresci(kategoria);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // Sprawdź czy nazwa pasuje do schematu kategoria-XXX (np. obraz-159.jpg)
    const prefixKategorii = kategoria === 'obrazy' ? 'obraz' : (kategoria === 'aranzacje' ? 'aranzacja' : 'dyplom');
    const pliki = fs.readdirSync(folder);
    const regexNumeru = new RegExp(`^${prefixKategorii}-(\\d+)`, 'i');

    let maxNr = 0;
    pliki.forEach((plik) => {
      const match = plik.match(regexNumeru);
      if (match && match[1]) {
        const nr = parseInt(match[1], 10);
        if (nr > maxNr) maxNr = nr;
      }
    });

    const nowyNumer = String(maxNr + 1).padStart(3, '0');
    return `${prefixKategorii}-${nowyNumer}${ext}`;
  };

  /**
   * Dodaje nową pracę do pliku YAML oraz obsługuje pozycję (domyślnie: na początku galerii).
   */
  const dodajPrace = (kategoria, danePracy, pozycja = 'poczatek') => {
    const lista = odczytajZYaml(kategoria);

    const nowyWpis = {
      zdjecie: danePracy.zdjecie,
      tytul: danePracy.tytul || '',
      technika: danePracy.technika || '',
      wymiary: danePracy.wymiary || '',
      rok: danePracy.rok || '',
      opis: danePracy.opis || '',
      wyrozniony: Boolean(danePracy.wyrozniony),
      ukryty: Boolean(danePracy.ukryty)
    };

    // 'poczatek' w galerii oznacza koniec listy YAML (ponieważ galeria odwraca listę)
    if (pozycja === 'poczatek') {
      lista.push(nowyWpis);
    } else {
      lista.unshift(nowyWpis);
    }

    zapiszDoYaml(kategoria, lista);
    return Object.freeze(nowyWpis);
  };

  /**
   * Aktualizuje metadane istniejącej pracy.
   */
  const aktualizujPrace = (kategoria, sciezkaZdjecia, noweDane) => {
    const lista = odczytajZYaml(kategoria);
    const indeks = lista.findIndex((p) => p.zdjecie === sciezkaZdjecia);

    if (indeks === -1) {
      throw new Error(`Nie znaleziono pracy o ścieżce zdjęcia: ${sciezkaZdjecia}`);
    }

    lista[indeks] = {
      ...lista[indeks],
      tytul: noweDane.tytul !== undefined ? noweDane.tytul : lista[indeks].tytul,
      technika: noweDane.technika !== undefined ? noweDane.technika : lista[indeks].technika,
      wymiary: noweDane.wymiary !== undefined ? noweDane.wymiary : lista[indeks].wymiary,
      rok: noweDane.rok !== undefined ? noweDane.rok : lista[indeks].rok,
      opis: noweDane.opis !== undefined ? noweDane.opis : lista[indeks].opis,
      wyrozniony: noweDane.wyrozniony !== undefined ? Boolean(noweDane.wyrozniony) : lista[indeks].wyrozniony,
      ukryty: noweDane.ukryty !== undefined ? Boolean(noweDane.ukryty) : lista[indeks].ukryty
    };

    zapiszDoYaml(kategoria, lista);
    return Object.freeze(lista[indeks]);
  };

  /**
   * Usuwa pracę z listy YAML i opcjonalnie usuwa powiązany plik z dysku.
   */
  const usunPrace = (kategoria, sciezkaZdjecia, usunPlikZDysku = false) => {
    const lista = odczytajZYaml(kategoria);
    const nowaLista = lista.filter((p) => p.zdjecie !== sciezkaZdjecia);

    if (nowaLista.length === lista.length) {
      throw new Error(`Nie znaleziono pracy o ścieżce zdjęcia: ${sciezkaZdjecia}`);
    }

    zapiszDoYaml(kategoria, nowaLista);

    let usunietoPlik = false;
    if (usunPlikZDysku) {
      const sciezkaWzgledna = sciezkaZdjecia.replace(/^\//, '');
      const pelnaSciezka = path.join(rootDir, sciezkaWzgledna);
      if (fs.existsSync(pelnaSciezka)) {
        fs.unlinkSync(pelnaSciezka);
        usunietoPlik = true;
      }
    }

    return Object.freeze({ sukces: true, usunietoPlik });
  };

  /**
   * Zmienia kolejność prac na podstawie przekazanej tablicy ścieżek `zdjecie` w kolejności wyświetlania w galerii.
   */
  const zapiszKolejnosc = (kategoria, listaZdjecWGalerii) => {
    const aktualnaLista = odczytajZYaml(kategoria);
    const mapaPrac = new Map();

    aktualnaLista.forEach((praca) => {
      mapaPrac.set(praca.zdjecie, praca);
    });

    // listaZdjecWGalerii jest w kolejności [pierwsza_w_galerii, druga_w_galerii, ..., ostatnia_w_galerii]
    // W pliku YAML musi być odwrócona: [ostatnia_w_galerii, ..., pierwsza_w_galerii]
    const ulozonaLista = [];
    const odwroconaKolejnosc = [...listaZdjecWGalerii].reverse();

    odwroconaKolejnosc.forEach((sciezka) => {
      if (mapaPrac.has(sciezka)) {
        ulozonaLista.push(mapaPrac.get(sciezka));
        mapaPrac.delete(sciezka);
      }
    });

    // Dopisz prace, które mogły nie zostać przekazane (dla bezpieczeństwa danych)
    mapaPrac.forEach((brakujaca) => {
      ulozonaLista.unshift(brakujaca);
    });

    zapiszDoYaml(kategoria, ulozonaLista);
    return Object.freeze({ sukces: true, liczbaPrac: ulozonaLista.length });
  };

  return Object.freeze({
    getPrace,
    dodajPrace,
    aktualizujPrace,
    usunPrace,
    zapiszKolejnosc,
    generujUnikalnaNazwe,
    sciezkaKataloguTresci
  });
};

