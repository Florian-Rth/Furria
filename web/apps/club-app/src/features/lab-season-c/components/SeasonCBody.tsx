import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCState } from '../hooks/use-season-c';
import {
  EMPTY_TEXT,
  EMPTY_TITLE,
  LOAD_FAILED_TEXT,
  LOAD_FAILED_TITLE,
  RETRY,
} from '../season-c-copy';
import { SeasonCGrid } from './SeasonCGrid';
import { SeasonCLegend } from './SeasonCLegend';
import { SeasonCPane } from './SeasonCPane';
import { SeasonCSheet } from './SeasonCSheet';

interface SeasonCBodyProps {
  season: SeasonCState;
}

const SKELETON_ROWS = 8;

export const SeasonCBody: FC<SeasonCBodyProps> = ({ season }) => {
  const wide = useIsMediumScreen();

  if (season.isLoading) {
    return <KkSkeletonRow count={SKELETON_ROWS} />;
  }
  if (season.isFailed) {
    const retry = (
      <KkButton variant="outlined" onClick={season.retry}>
        {RETRY}
      </KkButton>
    );

    return <KkErrorState title={LOAD_FAILED_TITLE} description={LOAD_FAILED_TEXT} action={retry} />;
  }

  const grid =
    season.rows.length === 0 ? (
      <KkEmptyState title={EMPTY_TITLE} description={EMPTY_TEXT} />
    ) : (
      <SeasonCGrid season={season} />
    );
  const besideSelection = wide ? season.selection : null;
  const sheetSelection = wide ? null : season.selection;
  const pane =
    besideSelection === null ? null : (
      <SeasonCPane
        key={besideSelection.act.actId}
        selection={besideSelection}
        onClose={season.closeSelection}
      />
    );

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <SeasonCLegend />
      <KkPaneLayout>
        <KkPaneLayout.Main withPane={pane !== null}>{grid}</KkPaneLayout.Main>
        {pane}
      </KkPaneLayout>
      <SeasonCSheet selection={sheetSelection} onClose={season.closeSelection} />
    </Stack>
  );
};
