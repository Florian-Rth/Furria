import { definePublicDetailResource } from '@/lib/public-resource/define-public-resource';
import { serverSlugAddress } from '@/lib/public-resource/detail-address';
import type { NewsPost, NewsSection } from './schemas';
import { NewsArticleSchema, NewsResponseSchema } from './schemas';

type PostAddress = Pick<NewsPost, 'slug'>;

export const publicNews = definePublicDetailResource({
  path: '/api/public/news',
  schema: NewsResponseSchema,
  key: 'public-news',
  select: (response): NewsSection[] => response.sessions,
  detail: {
    schema: NewsArticleSchema,
    address: serverSlugAddress((post: PostAddress) => post.slug),
  },
});
