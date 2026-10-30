import { KkFacetStage } from '@furria/ui/KkFacetStage';
import { KkNote } from '@furria/ui/KkNote';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { OUTSIDE_NOTE } from '../act-card-copy';
import type { ActCardView } from '../act-card-view';
import { useActCardDoors } from '../hooks/use-act-card-doors';
import { ActCardHeader } from './ActCardHeader';
import { ActCardPane } from './ActCardPane';
import { ActCardSheets } from './ActCardSheets';
import { ActCardTiles } from './ActCardTiles';

interface ActCardBodyProps {
  view: ActCardView;
}

export const ActCardBody: FC<ActCardBodyProps> = ({ view }) => {
  const doors = useActCardDoors(view.doors);
  const outside = view.hasStudio ? null : <KkNote>{OUTSIDE_NOTE}</KkNote>;
  const pane =
    doors.pane === null ? null : (
      <Grid size={{ lg: 7 }} sx={{ minWidth: 0 }}>
        <ActCardPane view={view} door={doors.pane} />
      </Grid>
    );
  const side =
    doors.side === null ? null : (
      <Grid size={{ lg: 5 }} sx={{ minWidth: 0 }}>
        <ActCardPane view={view} door={doors.side} />
      </Grid>
    );

  if (doors.wide) {
    return (
      <KkFacetStage fill={false}>
        <ActCardHeader view={view} />
        {outside}
        <ActCardTiles view={view} current={doors.pane} fill={false} onOpen={doors.open} />
        <Grid container spacing={2.5} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          {pane}
          {side}
        </Grid>
      </KkFacetStage>
    );
  }

  return (
    <KkFacetStage fill>
      <ActCardHeader view={view} />
      {outside}
      <ActCardTiles view={view} current={null} fill onOpen={doors.open} />
      <ActCardSheets view={view} />
    </KkFacetStage>
  );
};
