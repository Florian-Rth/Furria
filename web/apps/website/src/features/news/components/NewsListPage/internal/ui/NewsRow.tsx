import { KkNewsRow } from '@furria/ui';
import type { FC } from 'react';
import { newsLinkOf } from '@/features/news/components/news-link';
import { newsPhotoOf } from '@/features/news/components/news-photo';
import { categoryLabelOf, newsCategoryOf } from '@/features/news/news-content';
import { formatLongDate, formatShortDate } from '@/lib/date';
import type { NewsPost } from '@/lib/public-news/schemas';

const ROW_PHOTO_SIZES = '(min-width: 900px) 20rem, 40vw';

interface NewsRowProps {
  post: NewsPost;
}

export const NewsRow: FC<NewsRowProps> = ({ post }) => {
  const category = newsCategoryOf(post.category);
  const shortDate = formatShortDate(post.publishedAt);
  const longDate = formatLongDate(post.publishedAt);
  const photo = newsPhotoOf(post.picture, ROW_PHOTO_SIZES);
  const posterWord = categoryLabelOf(post.category);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsRow
      title={post.title}
      teaser={post.teaser}
      category={category}
      shortDate={shortDate}
      longDate={longDate}
      photo={photo}
      posterWord={posterWord}
      link={link}
    />
  );
};
