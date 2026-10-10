import { KkNewsCard } from '@furria/ui';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { categoryLabelOf, newsCategoryOf } from '@/features/news/news-content';
import { formatShortDate } from '@/lib/date';
import type { NewsPost } from '@/lib/public-news/schemas';
import { newsLinkOf } from './news-link';
import { newsPhotoOf } from './news-photo';

const CARD_PHOTO_SIZES = '(min-width: 900px) 33vw, 100vw';

interface NewsCardProps {
  post: NewsPost;
  sx?: SxProps<Theme>;
}

export const NewsCard: FC<NewsCardProps> = ({ post, sx }) => {
  const category = newsCategoryOf(post.category);
  const date = formatShortDate(post.publishedAt);
  const photo = newsPhotoOf(post.picture, CARD_PHOTO_SIZES);
  const posterWord = categoryLabelOf(post.category);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsCard
      title={post.title}
      teaser={post.teaser}
      category={category}
      date={date}
      photo={photo}
      posterWord={posterWord}
      link={link}
      sx={sx}
    />
  );
};
