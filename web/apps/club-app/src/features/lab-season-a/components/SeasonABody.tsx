import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import type { FC } from 'react';
import type { SeasonA } from '../hooks/use-season-a';
import {
  EMPTY_TEXT,
  EMPTY_TITLE,
  LOAD_FAILED_TEXT,
  LOAD_FAILED_TITLE,
  RETRY,
} from '../season-a-copy';
import { SeasonDetailsPane } from './SeasonDetailsPane';
import { SeasonDetailsSheet } from './SeasonDetailsSheet';
import { SeasonRaster } from './SeasonRaster';

interface SeasonABodyProps {
  season: SeasonA;
}

const SKELETON_LINES = 12;

export const SeasonABody: FC<SeasonABodyProps> = ({ season }) => {
  const isMedium = useIsMediumScreen();
  const data = season.query.data;
  const retry = (): void => {
    void season.query.refetch();
  };

  if (data === undefined && season.query.isError) {
    return (
      <KkErrorState
        title={LOAD_FAILED_TITLE}
        description={LOAD_FAILED_TEXT}
        action={<KkButton onClick={retry}>{RETRY}</KkButton>}
      />
    );
  }
  if (data === undefined) {
    return <KkSkeletonBlock lines={SKELETON_LINES} />;
  }
  if (data.acts.length === 0 || data.evenings.length === 0) {
    return <KkEmptyState title={EMPTY_TITLE} description={EMPTY_TEXT} />;
  }

  const pick = isMedium ? season.pick : null;
  const pane =
    pick === null ? null : (
      <SeasonDetailsPane pick={pick} onToggle={season.toggle} onClose={season.close} />
    );
  const sheet = isMedium ? null : (
    <SeasonDetailsSheet pick={season.pick} onToggle={season.toggle} onClose={season.close} />
  );

  return (
    <>
      <KkPaneLayout>
        <KkPaneLayout.Main withPane={pick !== null}>
          <SeasonRaster season={season} follows={pick !== null} />
        </KkPaneLayout.Main>
        {pane}
      </KkPaneLayout>
      {sheet}
    </>
  );
};
