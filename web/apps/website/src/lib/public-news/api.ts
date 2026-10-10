import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { shouldRetryPublicRead } from '@/lib/api/public-read-retry';
import { queryClient } from '@/lib/query-client';
import type { NewsArticle, NewsSection } from './schemas';
import { NewsArticleSchema, NewsResponseSchema } from './schemas';

export const publicNewsKeys = {
  all: ['public-news'] as const,
  article: (slug: string): readonly ['public-news', string] => ['public-news', slug] as const,
};

const fetchPublicNews = async (): Promise<NewsSection[]> => {
  const response = await apiFetch('/api/public/news', { schema: NewsResponseSchema });

  return response.sessions;
};

const fetchPublicNewsArticle = (slug: string): Promise<NewsArticle> =>
  apiFetch(`/api/public/news/${encodeURIComponent(slug)}`, { schema: NewsArticleSchema });

export const usePublicNewsQuery = (): UseQueryResult<NewsSection[], Error> =>
  useQuery({ queryKey: publicNewsKeys.all, queryFn: fetchPublicNews });

export const ensurePublicNews = (): Promise<NewsSection[]> =>
  queryClient.ensureQueryData({ queryKey: publicNewsKeys.all, queryFn: fetchPublicNews });

export const ensurePublicNewsArticle = (slug: string): Promise<NewsArticle> =>
  queryClient.ensureQueryData({
    queryKey: publicNewsKeys.article(slug),
    queryFn: (): Promise<NewsArticle> => fetchPublicNewsArticle(slug),
    retry: shouldRetryPublicRead,
  });
