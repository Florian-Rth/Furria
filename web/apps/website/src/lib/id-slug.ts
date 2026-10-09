const TRANSLITERATIONS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

const GERMAN_SPECIALS = /[äöüß]/g;
const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_SLUG_RUNS = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const LEADING_ID = /^(\d+)(?:-|$)/;

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
