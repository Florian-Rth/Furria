import { selectTeaserPosts } from '@/features/news/news-content';
import { usePublicNewsQuery } from '@/lib/public-news/api';
import type { NewsPost } from '@/lib/public-news/schemas';

export const useTeaserPosts = (): NewsPost[] => {
  const { data } = usePublicNewsQuery();

  return data === undefined ? [] : selectTeaserPosts(data);
};
