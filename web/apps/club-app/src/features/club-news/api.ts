import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { requestNewsHub } from '@/features/news/requests';
import type { NewsHub } from '@/features/news/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestReadNews, requestReadNewsArticle } from './requests';
import type { ReadNews, ReadNewsArticle } from './schemas';

export const useReadNewsQuery = (): UseQueryResult<ReadNews, Error> =>
  useQuery({ queryKey: queryKeys.readNews, queryFn: requestReadNews });

export const useReadNewsArticleQuery = (slug: string): UseQueryResult<ReadNewsArticle, Error> =>
  useQuery({
    queryKey: queryKeys.readNewsArticle(slug),
    queryFn: () => requestReadNewsArticle(slug),
  });

export const useWriterNewsHubQuery = (writes: boolean): UseQueryResult<NewsHub, Error> =>
  useQuery({
    queryKey: queryKeys.newsHub,
    queryFn: () => withFreshAccessToken(requestNewsHub),
    enabled: writes,
  });
