import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, CLUB_ORIGIN } from '@/features/session/app-sections';
import { useWriteNewsActions } from '../hooks/use-read-news-actions';
import { READ_NEWS_TITLE } from '../read-news-copy';
import { ReadNewsBody } from './ReadNewsBody';

const header = <KkTitleHeader title={READ_NEWS_TITLE} />;

export const ReadNewsPage: FC = () => {
  const actions = useWriteNewsActions();

  return (
    <KkScreen
      kind="list"
      title={READ_NEWS_TITLE}
      origin={CLUB_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.news}
      actions={actions}
    >
      <ReadNewsBody />
    </KkScreen>
  );
};
