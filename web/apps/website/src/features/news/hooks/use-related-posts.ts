import { selectRelatedPosts } from '@/features/news/news-content';
import { publicNews } from '@/lib/public-news/api';
import type { NewsPost } from '@/lib/public-news/schemas';
import { readySourceData } from '@/lib/public-resource/public-source';

export const useRelatedPosts = (currentSlug: string): NewsPost[] => {
  const sections = readySourceData(publicNews.useSource());

  return sections === undefined ? [] : selectRelatedPosts(sections, currentSlug);
};
