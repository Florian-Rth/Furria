import { KkNewsHero } from '@furria/ui/KkNewsHero';
import type { FC } from 'react';
import { newsPhotoOf } from '@/features/news/components/news-photo';
import type { NewsArticle } from '@/lib/public-news/schemas';

const HERO_PHOTO_SIZES = '(min-width: 900px) 45rem, 100vw';

interface NewsPostHeroProps {
  article: NewsArticle;
}

export const NewsPostHero: FC<NewsPostHeroProps> = ({ article }) => {
  const photo = newsPhotoOf(article.picture, HERO_PHOTO_SIZES);
  const caption = article.picture === null ? null : article.pictureCaption;

  return <KkNewsHero photo={photo} caption={caption} />;
};
