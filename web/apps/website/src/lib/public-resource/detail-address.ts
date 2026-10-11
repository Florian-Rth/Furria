const TRANSLITERATIONS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

const GERMAN_SPECIALS = /[äöüß]/g;
const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_SLUG_RUNS = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const LEADING_ID = /^(\d+)(?:-|$)/;

export interface DetailAddress<TItem> {
  readKey: (slug: string) => string | null;
  slugOf: (item: TItem) => string;
}

interface IdTitle {
  id: number;
  title: string;
}

const slugifyTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(GERMAN_SPECIALS, (special) => TRANSLITERATIONS[special] ?? special)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(NON_SLUG_RUNS, '-')
    .replace(EDGE_DASHES, '');

export const buildIdSlug = (id: number, title: string): string => {
  const titleSlug = slugifyTitle(title);
  return titleSlug.length === 0 ? String(id) : `${id}-${titleSlug}`;
};

export const readSlugId = (slug: string): number | null => {
  const match = LEADING_ID.exec(slug);
  const id = match === null ? Number.NaN : Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const readIdKey = (slug: string): string | null => {
  const id = readSlugId(slug);
  return id === null ? null : String(id);
};

const readServerSlugKey = (slug: string): string | null => (slug.length === 0 ? null : slug);

export const idSlugAddress = <TItem>(identify: (item: TItem) => IdTitle): DetailAddress<TItem> => ({
  readKey: readIdKey,
  slugOf: (item: TItem): string => {
    const { id, title } = identify(item);
    return buildIdSlug(id, title);
  },
});

export const serverSlugAddress = <TItem>(
  slugOf: (item: TItem) => string,
): DetailAddress<TItem> => ({ readKey: readServerSlugKey, slugOf });
