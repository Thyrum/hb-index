import songsJson from "./data/songs.json" with { type: "json" };

export type Version = {
  number: string;
  title: string;
  subtitle?: string;
  lyricist?: string;
  composer?: string;
  original_title?: string;
  original_author?: string;
  copyright?: string;
  language?: string;
  first_line: string;
  links?: {
    lyrics?: string;
  } & Record<string, string>;
};

export type Song = {
  number: number;
  key: string;
  opwekking?: string;
  origin?: string;
  ccli?: string;
  ichthus_oud?: string;
  ichthus_nieuw?: string;
  themes: string[];
  bible_verses: string[];
  versions: Version[];
};

export const songs = compileTime(songsJson as Song[]);

export const themeMap = compileTime(
  (() => {
    const map = new Map<string, number[]>();
    for (const song of songs) {
      for (const theme of song.themes) {
        const themeLower = theme.toLowerCase();
        if (!map.has(themeLower)) {
          map.set(themeLower, []);
        }
        map.get(themeLower)!.push(song.number);
      }
    }
    return Array.from(map, ([name, value]) => ({
      theme: name,
      numbers: value,
    })).sort((a, b) => a.theme.localeCompare(b.theme));
  })(),
);

const bibleVerseRegex =
  /([1-3]?\s?\S+)\s+(\d+)(?::(\d+(-\d+)?(,\s*\d+(-\d+)?)*)?)?/g;

type VerseInfo = {
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

function sortChapterVerse(a: VerseInfo, b: VerseInfo): number {
  if (a.chapter !== b.chapter) {
    return a.chapter - b.chapter;
  }
  if ((a.verseStart ?? 0) !== (b.verseStart ?? 0)) {
    return (a.verseStart ?? 0) - (b.verseStart ?? 0);
  }
  return (a.verseEnd ?? 0) - (b.verseEnd ?? 0);
}

export const bibleBookMap = compileTime(
  (() => {
    const map = new Map<string, (VerseInfo & { number: number })[]>();
    for (const song of songs) {
      for (const bible_verse of song.bible_verses) {
        const [match] = bible_verse.matchAll(bibleVerseRegex);
        const [, book, chapter, verse] = match;
        const [verseStart, verseEnd] = (verse ?? "")
          .split("-")
          .map((v) => (v ? parseInt(v, 10) : undefined));
        if (!map.has(book)) {
          map.set(book, []);
        }
        map.get(book)!.push({
          chapter: parseInt(chapter, 10),
          verseStart,
          verseEnd,
          number: song.number,
        });
      }
    }
    // Sort the verses for each book
    for (const [book, verses] of map.entries()) {
      verses.sort(sortChapterVerse);
      map.set(book, verses);
    }
    return map;
  })(),
);
