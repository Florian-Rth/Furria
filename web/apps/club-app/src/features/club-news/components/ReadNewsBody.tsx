import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { toQueryErrorMessage } from '@/lib/query-error';
import { useReadNewsQuery } from '../api';
import { readNewsFrontOf } from '../read-news';
import {
  NEWS_EMPTY_DESCRIPTION,
  NEWS_EMPTY_TITLE,
  NEWS_ERROR_MESSAGES,
  NEWS_ERROR_TITLE,
  NEWS_LOADING,
  NEWS_RETRY,
} from '../read-news-copy';
import { ReadNewsFront } from './ReadNewsFront';

export const ReadNewsBody: FC = () => {
  const query = useReadNewsQuery();
  const errorMessage = toQueryErrorMessage(query.error, NEWS_ERROR_MESSAGES);

  const reload = (): void => {
    void query.refetch();
  };

  if (query.data === undefined) {
    if (errorMessage !== null) {
      const retry = (
        <KkButton loading={query.isFetching} onClick={reload}>
          {NEWS_RETRY}
        </KkButton>
      );

      return <KkErrorState title={NEWS_ERROR_TITLE} description={errorMessage} action={retry} />;
    }

    return <AppListSkeleton label={NEWS_LOADING} listShape="rows" />;
  }

  const front = readNewsFrontOf(query.data);

  if (front === null) {
    return <KkEmptyState title={NEWS_EMPTY_TITLE} description={NEWS_EMPTY_DESCRIPTION} />;
  }

  return <ReadNewsFront front={front} />;
};
