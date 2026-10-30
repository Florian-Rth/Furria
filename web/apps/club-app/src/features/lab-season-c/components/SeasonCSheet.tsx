import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCSelection } from '../hooks/use-season-c';
import { CLOSE } from '../season-c-copy';
import { SeasonCPaneContent } from './SeasonCPaneContent';

interface SeasonCSheetProps {
  selection: SeasonCSelection | null;
  onClose: () => void;
}

export const SeasonCSheet: FC<SeasonCSheetProps> = ({ selection, onClose }) => {
  const eyebrow = selection?.act.group?.name ?? '';
  const title = selection?.act.name ?? '';
  const body =
    selection === null ? null : (
      <Stack sx={{ px: 2, pb: 3, minWidth: 0 }}>
        <KkLaneInspector.Head eyebrow={eyebrow} title={title} />
        <SeasonCPaneContent key={selection.act.actId} selection={selection} />
      </Stack>
    );

  return (
    <KkBottomDrawer open={selection !== null} label={title} closeLabel={CLOSE} onClose={onClose}>
      {body}
    </KkBottomDrawer>
  );
};
