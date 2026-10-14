import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION, NEWS_TITLE } from '@/features/session';
import { NEWS_LEAD } from '../../hub-copy';
import { NewsHubBody } from './NewsHubBody';
import { useNewsHub } from './use-news-hub';

const header = <KkTitleHeader title={NEWS_TITLE} lead={NEWS_LEAD} />;

export const NewsHubPage: FC = () => {
  const hub = useNewsHub();

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={NEWS_TITLE}
      actions={hub.actions}
      header={header}
      handover={AREA_HANDOVERS.news}
    >
      <NewsHubBody hub={hub} />
    </KkScreen>
  );
};
