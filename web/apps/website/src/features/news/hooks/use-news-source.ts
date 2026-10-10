import type { NewsSource } from '@/features/news/news-source';
import { resolveNewsSource } from '@/features/news/news-source';
import { usePublicNewsQuery } from '@/lib/public-news/api';

export const useNewsSource = (): NewsSource => {
  const { data, isError, refetch } = usePublicNewsQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveNewsSource(data, isError, retry);
};
