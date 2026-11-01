import { KkNewsArticleHeader } from '@furria/ui/KkNewsArticleHeader';
import type { FC } from 'react';
import { buildPostByline, newsCategoryOf } from '@/features/news/news-content';
import type { NewsArticle } from '@/lib/public-news/schemas';

interface NewsPostMetaProps {
  article: NewsArticle;
}

export const NewsPostMeta: FC<NewsPostMetaProps> = ({ article }) => {
  const category = newsCategoryOf(article.category);
  const byline = buildPostByline(article);

  return <KkNewsArticleHeader.Meta category={category} byline={byline} />;
};
