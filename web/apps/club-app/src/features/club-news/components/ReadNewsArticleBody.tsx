import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';
import {
  ARTICLE_ERROR_TITLE,
  NEWS_ERROR_MESSAGES,
  NEWS_LOADING,
  NEWS_RETRY,
} from '../read-news-copy';
import type { ReadNewsArticle as Article } from '../schemas';
import { ReadNewsArticle } from './ReadNewsArticle';
import { ReadNewsGone } from './ReadNewsGone';

const SKELETON_LINES = 8;

interface ReadNewsArticleBodyProps {
  query: UseQueryResult<Article, Error>;
}

export const ReadNewsArticleBody: FC<ReadNewsArticleBodyProps> = ({ query }) => {
  const errorMessage = toQueryErrorMessage(query.error, NEWS_ERROR_MESSAGES);

  const reload = (): void => {
    void query.refetch();
  };

  if (query.data !== undefined) {
    return <ReadNewsArticle article={query.data} />;
  }
  if (isNotFoundError(query.error)) {
    return <ReadNewsGone />;
  }
  if (errorMessage !== null) {
    const retry = (
      <KkButton loading={query.isFetching} onClick={reload}>
        {NEWS_RETRY}
      </KkButton>
    );

    return <KkErrorState title={ARTICLE_ERROR_TITLE} description={errorMessage} action={retry} />;
  }

  return (
    <AppSkeletonRegion label={NEWS_LOADING}>
      <KkSkeletonBlock lines={SKELETON_LINES} />
    </AppSkeletonRegion>
  );
};
