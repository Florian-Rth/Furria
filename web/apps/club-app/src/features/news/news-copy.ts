import type { NewsCategory, NewsRequirement, NewsStage, NewsVersionPart } from './types';

export const NEWS_EDITOR_ROUTE = '/news/$postId';
export const NEW_POST_ID = 'neu';

export const NEW_POST_LABEL = 'Neue Meldung';
export const MANAGING_LOGIN_NAME = 'Verwaltungszugang';

export const STAGE_WORDS: Record<NewsStage, string> = {
  draft: 'Entwurf',
  live: 'Live',
  pending: 'Änderungen offen',
  withdrawn: 'Zurückgezogen',
};

export const REQUIREMENT_WORDS: Record<NewsRequirement, string> = {
  category: 'Kategorie',
  title: 'Titel',
  teaser: 'Vorspann',
  text: 'Text',
};

export const PART_WORDS: Record<NewsVersionPart, string> = {
  category: 'Kategorie',
  title: 'Titel',
  teaser: 'Vorspann',
  picture: 'Bild',
  caption: 'Bildnachweis',
  text: 'Text',
  event: 'Veranstaltung',
  album: 'Album',
};

export type NewsCategoryTone = 'red' | 'gold' | 'ink';

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  session: 'Session',
  achievements: 'Erfolge',
  club: 'Verein',
  groups: 'Gruppen',
};

export const CATEGORY_TONES: Record<NewsCategory, NewsCategoryTone> = {
  session: 'red',
  achievements: 'gold',
  club: 'ink',
  groups: 'ink',
};

export const WEBSITE_HOST = 'furria.de';
export const PUBLIC_NEWS_PATH = '/news/';
export const CHANGED_MARK = 'geändert';
export const MISSING_MARK = 'fehlt';
export const UNTITLED = 'Ohne Titel';
