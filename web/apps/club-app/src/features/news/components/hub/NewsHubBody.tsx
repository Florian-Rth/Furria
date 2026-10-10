import { KkButton, KkErrorState } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { toQueryErrorMessage } from '@/lib/query-error';
import { HUB_ERROR_MESSAGES, HUB_ERROR_TITLE, HUB_LOADING, HUB_RETRY } from '../../hub-copy';
import { NewsHubEmpty } from './NewsHubEmpty';
import { NewsHubSection } from './NewsHubSection';
import { NewsPressPlan } from './NewsPressPlan';
import type { NewsHubState } from './use-news-hub';

interface NewsHubBodyProps {
  hub: NewsHubState;
}

export const NewsHubBody: FC<NewsHubBodyProps> = ({ hub }) => {
  const { query } = hub;
  const errorMessage = toQueryErrorMessage(query.error, HUB_ERROR_MESSAGES);
  const reload = (): void => {
    void query.refetch();
  };

  if (query.data === undefined) {
    if (errorMessage !== null) {
      const retry = <KkButton onClick={reload}>{HUB_RETRY}</KkButton>;
      return <KkErrorState title={HUB_ERROR_TITLE} description={errorMessage} action={retry} />;
    }
    return <AppListSkeleton label={HUB_LOADING} listShape="rows" />;
  }
  if (hub.isEmpty) {
    return <NewsHubEmpty onCreate={hub.openNew} />;
  }

  const sections = hub.sections.map((section, order) => (
    <NewsHubSection
      key={section.key}
      section={section}
      order={order}
      highlightedId={hub.highlightedId}
      onOpen={hub.openPost}
    />
  ));

  return (
    <Stack sx={{ rowGap: 3, minWidth: 0 }}>
      <NewsPressPlan plan={hub.plan} titles={hub.titles} onReveal={hub.revealPost} />
      {sections}
    </Stack>
  );
};
