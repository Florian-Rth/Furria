import type { FC } from 'react';
import { NewsListPage } from '@/features/news/components/NewsListPage/NewsListPage';
import { NewsLoading } from '@/features/news/components/NewsLoading';
import { NewsUnavailable } from '@/features/news/components/NewsUnavailable';
import { publicNews } from '@/lib/public-news/api';

export const NewsScreen: FC = () => {
  const source = publicNews.useSource();

  if (source.status === 'loading') {
    return <NewsLoading />;
  }

  if (source.status === 'error') {
    return <NewsUnavailable onRetry={source.retry} />;
  }

  return <NewsListPage sections={source.data} />;
};
