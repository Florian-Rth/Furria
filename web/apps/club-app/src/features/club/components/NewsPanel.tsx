import { KkNewsRowList } from '@furria/ui/KkNewsRowList';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useReadNewsQuery } from '@/features/club-news/api';
import { ReadNewsRow } from '@/features/club-news/components/ReadNewsRow';
import { newestPostsOf } from '@/features/club-news/read-news';
import {
  ALL_NEWS_LABEL,
  NEWS_ERROR_MESSAGES,
  READ_NEWS_PANEL_TITLE,
} from '@/features/club-news/read-news-copy';
import { READ_NEWS_PATH } from '@/features/club-news/read-news-paths';
import { toQueryErrorMessage } from '@/lib/query-error';
import { CLUB_RETRY_LABEL } from '../club-labels';

const PANEL_POSTS = 3;

const openAll: KkPanelAction = {
  label: ALL_NEWS_LABEL,
  emphasis: 'quiet',
  component: Link,
  to: READ_NEWS_PATH,
};

export const NewsPanel: FC = () => {
  const news = useReadNewsQuery();
  const errorMessage = toQueryErrorMessage(news.error, NEWS_ERROR_MESSAGES);

  const retry = (): void => {
    void news.refetch();
  };

  if (news.data === undefined) {
    return errorMessage === null ? null : (
      <KkPanelSection title={READ_NEWS_PANEL_TITLE}>
        <KkRetryAlert
          message={errorMessage}
          retrying={news.isFetching}
          onRetry={retry}
          retryLabel={CLUB_RETRY_LABEL}
        />
      </KkPanelSection>
    );
  }

  const posts = newestPostsOf(news.data, PANEL_POSTS);

  if (posts.length === 0) {
    return null;
  }

  const rows = posts.map((post) => <ReadNewsRow key={post.slug} post={post} />);

  return (
    <KkPanelSection title={READ_NEWS_PANEL_TITLE} action={openAll}>
      <KkNewsRowList fit="column">{rows}</KkNewsRowList>
    </KkPanelSection>
  );
};
