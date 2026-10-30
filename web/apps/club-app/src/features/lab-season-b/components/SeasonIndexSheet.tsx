import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { INDEX_CLEAR, INDEX_CLOSE_LABEL, INDEX_LABEL } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import { SeasonIndexList } from './SeasonIndexList';

const SHEET_PREFIX = 'sheet:';

export const SeasonIndexSheet: FC = () => {
  const board = useSeasonBoardContext();
  const clear =
    board.markedName === null ? null : (
      <KkButton size="small" variant="outlined" onClick={board.clearMark}>
        {INDEX_CLEAR}
      </KkButton>
    );

  return (
    <KkBottomDrawer
      open={board.indexOpen}
      label={INDEX_LABEL}
      closeLabel={INDEX_CLOSE_LABEL}
      onClose={board.closeIndex}
    >
      <Stack sx={{ gap: 1, minWidth: 0, alignItems: 'stretch' }}>
        {clear}
        <SeasonIndexList keyPrefix={SHEET_PREFIX} />
      </Stack>
    </KkBottomDrawer>
  );
};
