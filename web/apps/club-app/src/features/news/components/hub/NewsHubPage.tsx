import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION, NEWS_TITLE } from '@/features/session/app-sections';
import { NewsHubBody } from './NewsHubBody';
import { useNewsHub } from './use-news-hub';

const header = <KkTitleHeader title={NEWS_TITLE} />;

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
