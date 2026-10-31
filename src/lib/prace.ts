import type { ImageMetadata } from 'astro';
import { parse } from 'yaml';

/**
 * Zbiory zdjęć. Każdy zbiór to folder w src/tresci/<nazwa>/.
 * Wystarczy wrzucić plik graficzny do folderu – pojawi się na stronie po zbudowaniu.
 * Opcjonalne opisy (tytuł, technika, ...) trzymamy w pliku opisy.yml w tym samym folderze.
 */
export type Zbior = 'obrazy' | 'aranzacje' | 'dyplomy';

export interface Praca {
  id: string;
  plik: string;
  image: ImageMetadata;
  tytul?: string;
  technika?: string;
  wymiary?: string;
  rok?: string | number;
  opis?: string;
  wyrozniony?: boolean;
  ukryty?: boolean;
}

const obrazki = import.meta.glob<{ default: ImageMetadata }>(
  '/src/tresci/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);
const opisy = import.meta.glob<string>('/src/tresci/*/opisy.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const wczytajOpisy = (zbior: Zbior): Record<string, Partial<Praca>> => {
  const raw = opisy[`/src/tresci/${zbior}/opisy.yml`];
  return (raw && parse(raw)) || {};
};

/** Zwraca prace z danego zbioru – najwyższy numer (najnowsza praca) na początku. */
export function getPrace(zbior: Zbior): Praca[] {
  const meta = wczytajOpisy(zbior);
  const prefix = `/src/tresci/${zbior}/`;

  return Object.entries(obrazki)
    .filter(([sciezka]) => sciezka.startsWith(prefix))
    .map(([sciezka, mod]) => {
      const plik = sciezka.slice(prefix.length);
      return {
        id: plik.replace(/\.[^.]+$/, ''),
        plik,
        image: mod.default,
        ...(meta[plik] ?? {}),
      };
    })
    .filter((p) => !p.ukryty)
    .sort((a, b) => b.plik.localeCompare(a.plik, 'pl', { numeric: true }));
}

/** Podpis pracy widoczny w galerii i w podglądzie, np. „Kobieta · olej na płótnie · 2023”. */
export const podpis = (p: Praca) =>
  [p.tytul, p.technika, p.wymiary, p.rok].filter(Boolean).join(' · ');
