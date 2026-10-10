import { KkNewsCard } from '@furria/ui';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { newsCategoryOf } from '@/features/news/news-content';
import { formatShortDate } from '@/lib/date';
import { newsLinkOf } from './news-link';
import { newsPhotoOf } from './news-photo';

interface NewsCardProps {
  post: NewsPost;
  sx?: SxProps<Theme>;
}

export const NewsCard: FC<NewsCardProps> = ({ post, sx }) => {
  const category = newsCategoryOf(post.category);
  const date = formatShortDate(post.publishedAt);
  const photo = newsPhotoOf(post);
  const link = newsLinkOf(post.slug);

  return (
    <KkNewsCard
      title={post.title}
      teaser={post.teaser}
      category={category}
      date={date}
      photo={photo}
      posterWord={post.category}
      link={link}
      sx={sx}
    />
  );
};
