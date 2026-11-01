import { apiFetch } from '@/lib/api/api-fetch';
import type { ReadNews, ReadNewsArticle } from './schemas';
import { ReadNewsArticleSchema, ReadNewsSchema } from './schemas';

const PUBLISHED_NEWS_PATH = '/api/public/news';

export const requestReadNews = (): Promise<ReadNews> =>
  apiFetch(PUBLISHED_NEWS_PATH, { schema: ReadNewsSchema });

export const requestReadNewsArticle = (slug: string): Promise<ReadNewsArticle> =>
  apiFetch(`${PUBLISHED_NEWS_PATH}/${encodeURIComponent(slug)}`, {
    schema: ReadNewsArticleSchema,
  });
