import type { ImageMetadata } from 'astro';
import { parse } from 'yaml';

/**
 * Zbiory prac. Zdjęcia leżą w src/tresci/<zbior>/, a lista prac (kolejność, tytuły, opisy)
 * w src/dane/<zbior>.yml – tę listę edytuje panel Pages CMS (konfiguracja w .pages.yml).
 * Lista jest chronologiczna: ostatnia pozycja to najnowsza praca i wyświetla się jako pierwsza.
 */
export type Zbior = 'obrazy' | 'aranzacje' | 'dyplomy';

interface Wpis {
  zdjecie: string;
  tytul?: string;
  technika?: string;
  wymiary?: string;
  rok?: string | number;
  opis?: string;
  wyrozniony?: boolean;
  ukryty?: boolean;
}

export interface Praca extends Omit<Wpis, 'zdjecie'> {
  id: string;
  plik: string;
  image: ImageMetadata;
}

const obrazki = import.meta.glob<{ default: ImageMetadata }>(
  '/src/tresci/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);
const listy = import.meta.glob<string>('/src/dane/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const wczytajListe = (zbior: Zbior): Wpis[] => {
  const raw = listy[`/src/dane/${zbior}.yml`];
  return ((raw && parse(raw)) || []).filter((w: Wpis | null) => w?.zdjecie);
};

/** Zwraca prace z danego zbioru – najnowsza (ostatnia na liście) na początku. */
export function getPrace(zbior: Zbior): Praca[] {
  const lista = wczytajListe(zbior);
  const naLiscie = new Set<string>();
  const prace: Praca[] = [];

  for (const { zdjecie, ...meta } of lista) {
    const sciezka = zdjecie.startsWith('/') ? zdjecie : `/${zdjecie}`;
    naLiscie.add(sciezka);
    const mod = obrazki[sciezka];
    if (!mod) {
      console.warn(`[prace] ${zbior}: brak pliku ${sciezka} – pozycja pominięta`);
      continue;
    }
    if (meta.ukryty) continue;
    const plik = sciezka.split('/').pop()!;
    prace.push({ id: plik.replace(/\.[^.]+$/, ''), plik, image: mod.default, ...meta });
  }

  const pominiete = Object.keys(obrazki).filter((s) => s.startsWith(`/src/tresci/${zbior}/`) && !naLiscie.has(s));
  if (pominiete.length) {
    console.warn(`[prace] ${zbior}: pliki bez wpisu w src/dane/${zbior}.yml (niewidoczne): ${pominiete.join(', ')}`);
  }

  return prace.reverse();
}

/** Podpis pracy widoczny w galerii i w podglądzie, np. „Kobieta · olej na płótnie · 2023”. */
export const podpis = (p: Praca) =>
  [p.tytul, p.technika, p.wymiary, p.rok].filter(Boolean).join(' · ');
