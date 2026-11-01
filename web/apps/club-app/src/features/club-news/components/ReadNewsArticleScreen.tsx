import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useReadNewsArticleQuery } from '../api';
import { useEditArticleActions } from '../hooks/use-read-news-actions';
import { ARTICLE_FALLBACK_TITLE } from '../read-news-copy';
import { READ_NEWS_ORIGIN } from '../read-news-paths';
import { ReadNewsArticleBody } from './ReadNewsArticleBody';

interface ReadNewsArticleScreenProps {
  slug: string;
}

export const ReadNewsArticleScreen: FC<ReadNewsArticleScreenProps> = ({ slug }) => {
  const query = useReadNewsArticleQuery(slug);
  const actions = useEditArticleActions(slug);
  const title = query.data?.title ?? ARTICLE_FALLBACK_TITLE;

  return (
    <KkScreen kind="detail" title={title} origin={READ_NEWS_ORIGIN} actions={actions}>
      <ReadNewsArticleBody query={query} />
    </KkScreen>
  );
};
