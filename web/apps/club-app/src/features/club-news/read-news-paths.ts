import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { CLUB_NEWS_PATH } from '@/features/session/app-sections';
import { READ_NEWS_TITLE } from './read-news-copy';

export const READ_NEWS_PATH = CLUB_NEWS_PATH;
export const READ_NEWS_ARTICLE_ROUTE = '/club/news/$slug';
export const READ_NEWS_ORIGIN: KkScreenOrigin = { label: READ_NEWS_TITLE, to: READ_NEWS_PATH };

export const articlePathOf = (slug: string): string =>
  `${READ_NEWS_PATH}/${encodeURIComponent(slug)}`;
