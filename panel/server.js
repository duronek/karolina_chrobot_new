import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDataManager } from './lib/dataManager.js';
import { createProcessRunner } from './lib/processRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Fabryka serwera aplikacji Express.
 */
export const createAppServer = (config = {}) => {
  const rootDir = config.rootDir || projectRoot;
  const port = config.port || process.env.PORT || 3000;

  const dataManager = createDataManager({ rootDir });
  const processRunner = createProcessRunner({ rootDir });
  const app = express();

  // Konfiguracja uploadu zdjęć przez multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const kategoria = req.body.kategoria || 'obrazy';
      const destDir = dataManager.sciezkaKataloguTresci(kategoria);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const kategoria = req.body.kategoria || 'obrazy';
      const nazwaPliku = dataManager.generujUnikalnaNazwe(kategoria, file.originalname);
      req.wygenerowanaNazwaPliku = nazwaPliku;
      cb(null, nazwaPliku);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      const dozwoloneRozszerzenia = /\.(jpg|jpeg|png|webp|avif)$/i;
      if (!file.originalname.match(dozwoloneRozszerzenia)) {
        return cb(new Error('Dozwolone są wyłącznie pliki graficzne: JPG, PNG, WebP, AVIF.'));
      }
      cb(null, true);
    }
  });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serwowanie plików ze strony (zdjęcia z src/tresci)
  app.use('/src/tresci', express.static(path.join(rootDir, 'src', 'tresci')));

  // Serwowanie statycznych plików panelu
  app.use(express.static(path.join(__dirname, 'public')));

  // --- API: Prace (obrazy, aranżacje, dyplomy) ---

  // Pobranie listy prac dla danej kategorii
  app.get('/api/prace', (req, res) => {
    try {
      const kategoria = req.query.kategoria || 'obrazy';
      const prace = dataManager.getPrace(kategoria);
      res.json({ sukces: true, kategoria, prace });
    } catch (err) {
      res.status(400).json({ sukces: false, blad: err.message });
    }
  });

  // Dodanie nowej pracy z uploadem zdjęcia
  app.post('/api/prace', upload.single('zdjeciePlik'), (req, res) => {
    try {
      const kategoria = req.body.kategoria || 'obrazy';
      if (!req.file && !req.body.zdjecieIstniejace) {
        return res.status(400).json({ sukces: false, blad: 'Plik zdjęcia jest wymagany.' });
      }

      const sciezkaZdjecia = req.file
        ? `/src/tresci/${kategoria}/${req.wygenerowanaNazwaPliku}`
        : req.body.zdjecieIstniejace;

      const pozycja = req.body.pozycja || 'poczatek'; // domyślnie na początku galerii
      const nowaPraca = dataManager.dodajPrace(
        kategoria,
        {
          zdjecie: sciezkaZdjecia,
          tytul: req.body.tytul || '',
          technika: req.body.technika || '',
          wymiary: req.body.wymiary || '',
          rok: req.body.rok || '',
          opis: req.body.opis || '',
          wyrozniony: req.body.wyrozniony === 'true' || req.body.wyrozniony === true,
          ukryty: req.body.ukryty === 'true' || req.body.ukryty === true
        },
        pozycja
      );

      res.status(201).json({ sukces: true, praca: nowaPraca });
    } catch (err) {
      res.status(500).json({ sukces: false, blad: err.message });
    }
  });

  // Aktualizacja danych pracy (tytuł, wymiary, opis itp.)
  app.put('/api/prace', (req, res) => {
    try {
      const { kategoria, zdjecie, ...dane } = req.body;
      if (!kategoria || !zdjecie) {
        return res.status(400).json({ sukces: false, blad: 'Wymagane pola: kategoria oraz zdjecie.' });
      }

      const zaktualizowana = dataManager.aktualizujPrace(kategoria, zdjecie, dane);
      res.json({ sukces: true, praca: zaktualizowana });
    } catch (err) {
      res.status(400).json({ sukces: false, blad: err.message });
    }
  });

  // Usunięcie pracy
  app.delete('/api/prace', (req, res) => {
    try {
      const { kategoria, zdjecie, usunPlik } = req.body;
      if (!kategoria || !zdjecie) {
        return res.status(400).json({ sukces: false, blad: 'Wymagane pola: kategoria oraz zdjecie.' });
      }

      const wynik = dataManager.usunPrace(kategoria, zdjecie, Boolean(usunPlik));
      res.json({ sukces: true, wynik });
    } catch (err) {
      res.status(400).json({ sukces: false, blad: err.message });
    }
  });

  // Zapis nowej kolejności prac
  app.post('/api/kolejnosc', (req, res) => {
    try {
      const { kategoria, zdjecia } = req.body;
      if (!kategoria || !Array.isArray(zdjecia)) {
        return res.status(400).json({ sukces: false, blad: 'Wymagane pola: kategoria oraz tablica zdjecia.' });
      }

      const wynik = dataManager.zapiszKolejnosc(kategoria, zdjecia);
      res.json({ sukces: true, wynik });
    } catch (err) {
      res.status(400).json({ sukces: false, blad: err.message });
    }
  });

  // --- API: Procesy zewnętrzne (Podgląd Astro & Deploy Cloudflare) ---

  // Status serwera developerskiego Astro
  app.get('/api/dev/status', (req, res) => {
    res.json(processRunner.getDevStatus());
  });

  // Uruchomienie serwera Astro
  app.post('/api/dev/start', (req, res) => {
    const wynik = processRunner.startDevServer();
    res.json(wynik);
  });

  // Zatrzymanie serwera Astro
  app.post('/api/dev/stop', (req, res) => {
    const wynik = processRunner.stopDevServer();
    res.json(wynik);
  });

  // Wykonanie publikacji do Cloudflare
  app.post('/api/deploy', async (req, res) => {
    try {
      const wynik = await processRunner.runDeploy();
      res.json(wynik);
    } catch (err) {
      res.status(500).json({ sukces: false, blad: err.message });
    }
  });

  // Start serwera
  const start = () => {
    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`\n======================================================`);
        console.log(`🎨 Panel Administracyjny Karolina Chrobot uruchomiony!`);
        console.log(`Adres: http://localhost:${port}`);
        console.log(`======================================================\n`);
        resolve(server);
      });
    });
  };

  return Object.freeze({
    app,
    start,
    dataManager,
    processRunner
  });
};

// Automatyczne uruchomienie przy bezpośrednim wywołaniu `node server.js`
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const server = createAppServer();
  server.start();
}

