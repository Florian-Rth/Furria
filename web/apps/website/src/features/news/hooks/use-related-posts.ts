import { selectRelatedPosts } from '@/features/news/news-content';
import { usePublicNewsQuery } from '@/lib/public-news/api';
import type { NewsPost } from '@/lib/public-news/schemas';

export const useRelatedPosts = (currentSlug: string): NewsPost[] => {
  const { data } = usePublicNewsQuery();

  return data === undefined ? [] : selectRelatedPosts(data, currentSlug);
};
