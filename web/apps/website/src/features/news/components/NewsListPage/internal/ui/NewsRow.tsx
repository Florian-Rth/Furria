import { KkNewsRow } from '@furria/ui';
import type { FC } from 'react';
import { newsLinkOf } from '@/features/news/components/news-link';
import { newsPhotoOf } from '@/features/news/components/news-photo';
import type { NewsPost } from '@/features/news/news-content';
import { newsCategoryOf } from '@/features/news/news-content';
import { formatLongDate, formatShortDate } from '@/lib/date';

interface NewsRowProps {
  post: NewsPost;
}

export const NewsRow: FC<NewsRowProps> = ({ post }) => {
  const category = newsCategoryOf(post.category);
  const shortDate = formatShortDate(post.publishedAt);
  const longDate = formatLongDate(post.publishedAt);
  const photo = newsPhotoOf(post);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsRow
      title={post.title}
      teaser={post.teaser}
      category={category}
      shortDate={shortDate}
      longDate={longDate}
      photo={photo}
      posterWord={post.category}
      link={link}
    />
  );
};
