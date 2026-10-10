import type { ReactNode } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { NewsPlaceholderPhoto } from './NewsPlaceholderPhoto';

export const newsPhotoOf = (post: NewsPost): ReactNode =>
  post.image === null ? null : <NewsPlaceholderPhoto label={post.image} />;
