import { KkNewsLead } from '@furria/ui';
import type { FC } from 'react';
import {
  categoryLabelOf,
  deriveReadingTime,
  newsCategoryOf,
  readMoreLabel,
} from '@/features/news/news-content';
import { formatLongDate } from '@/lib/date';
import type { NewsPost } from '@/lib/public-news/schemas';
import { newsLinkOf } from './news-link';
import { newsPhotoOf } from './news-photo';

const LEAD_PHOTO_SIZES = '(min-width: 900px) 60vw, 100vw';

interface NewsLeadProps {
  post: NewsPost;
}

export const NewsLead: FC<NewsLeadProps> = ({ post }) => {
  const category = newsCategoryOf(post.category);
  const date = formatLongDate(post.publishedAt);
  const photo = newsPhotoOf(post.picture, LEAD_PHOTO_SIZES);
  const posterWord = categoryLabelOf(post.category);
  const readingTime = deriveReadingTime(post.text);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsLead
      title={post.title}
      teaser={post.teaser}
      category={category}
      date={date}
      photo={photo}
      posterWord={posterWord}
      readMoreLabel={readMoreLabel}
      readingTime={readingTime}
      link={link}
    />
  );
};
