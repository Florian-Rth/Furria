import { KkNote } from '@furria/ui/KkNote';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { OUTSIDE_NOTE } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { useActCDoors } from '../hooks/use-act-c-doors';
import { ActCDetails } from './ActCDetails';
import { ActCHeader } from './ActCHeader';
import { ActCPane } from './ActCPane';
import { ActCSheets } from './ActCSheets';
import { ActCTiles } from './ActCTiles';

interface ActCBodyProps {
  view: ActCView;
}

export const ActCBody: FC<ActCBodyProps> = ({ view }) => {
  const doors = useActCDoors(view.doors);
  const outside = view.hasStudio ? null : <KkNote>{OUTSIDE_NOTE}</KkNote>;
  const details = view.editor ? <ActCDetails view={view} /> : null;
  const panePart = doors.pane === null ? null : <ActCPane view={view} door={doors.pane} />;
  const pane =
    panePart === null && details === null ? null : (
      <Grid size={{ lg: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          {panePart}
          {details}
        </Stack>
      </Grid>
    );
  const side =
    doors.side === null ? null : (
      <Grid size={{ lg: 5 }} sx={{ minWidth: 0 }}>
        <ActCPane view={view} door={doors.side} />
      </Grid>
    );

  if (doors.wide) {
    return (
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <ActCHeader view={view} />
        {outside}
        <ActCTiles view={view} current={doors.pane} onOpen={doors.open} />
        <Grid container spacing={2.5} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          {pane}
          {side}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <ActCHeader view={view} />
      {outside}
      <ActCTiles view={view} current={null} onOpen={doors.open} />
      {details}
      <ActCSheets view={view} />
    </Stack>
  );
};
