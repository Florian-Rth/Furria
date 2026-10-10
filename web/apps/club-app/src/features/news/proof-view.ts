import type { NewsVersion, NewsVersionPart } from './types';

const SURFACE_PARTS: readonly NewsVersionPart[] = ['category', 'title', 'teaser', 'picture'];

const GERMAN_LOCALE = 'de-DE';

const longDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: '2-digit',
  month: '2-digit',
});

const clockFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
});

export const proofDayOf = (publishedAt: string | null, today: Date): Date =>
  publishedAt === null ? today : new Date(publishedAt);

export const longDateLabelOf = (day: Date): string => longDateFormat.format(day);

export const shortDateLabelOf = (day: Date): string => shortDateFormat.format(day);

export const clockLabelOf = (moment: Date): string => clockFormat.format(moment);

export const proofPictureSourceOf = (version: Pick<NewsVersion, 'picture'>): string | null => {
  const { picture } = version;
  if (picture === null || picture.state !== 'ready') {
    return null;
  }
  return picture.source;
};

export const isProofChanged = (changedParts: readonly NewsVersionPart[]): boolean =>
  changedParts.some((part) => SURFACE_PARTS.includes(part));
