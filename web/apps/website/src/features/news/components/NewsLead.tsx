import { KkNewsLead } from '@furria/ui';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { deriveReadingTime, newsCategoryOf, readMoreLabel } from '@/features/news/news-content';
import { formatLongDate } from '@/lib/date';
import { newsLinkOf } from './news-link';
import { newsPhotoOf } from './news-photo';

interface NewsLeadProps {
  post: NewsPost;
}

export const NewsLead: FC<NewsLeadProps> = ({ post }) => {
  const category = newsCategoryOf(post.category);
  const date = formatLongDate(post.publishedAt);
  const photo = newsPhotoOf(post);
  const readingTime = deriveReadingTime(post.text);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsLead
      title={post.title}
      teaser={post.teaser}
      category={category}
      date={date}
      photo={photo}
      posterWord={post.category}
      readMoreLabel={readMoreLabel}
      readingTime={readingTime}
      link={link}
    />
  );
};
