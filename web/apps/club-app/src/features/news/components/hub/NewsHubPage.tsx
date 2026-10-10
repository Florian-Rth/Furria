import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION, NEWS_TITLE } from '@/features/session';
import { NewsHubBody } from './NewsHubBody';
import { useNewsHub } from './use-news-hub';

export const NewsHubPage: FC = () => {
  const hub = useNewsHub();

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={NEWS_TITLE}
      actions={hub.actions}
      handover={AREA_HANDOVERS.news}
    >
      <NewsHubBody hub={hub} />
    </KkScreen>
  );
};
