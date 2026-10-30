import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { INDEX_CLEAR, INDEX_NONE, INDEX_TITLE } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import { COLUMN_CONTAINER } from '../season-layout';
import { SeasonIndexList } from './SeasonIndexList';

interface SeasonIndexColumnProps {
  height: string;
}

const INDEX_WIDTH = '17rem';
const LIST_SX = { mt: 0.75 };

export const SeasonIndexColumn: FC<SeasonIndexColumnProps> = ({ height }) => {
  const board = useSeasonBoardContext();
  const status =
    board.markedName === null ? (
      <KkMeta>{INDEX_NONE}</KkMeta>
    ) : (
      <KkButton size="small" variant="text" onClick={board.clearMark}>
        {INDEX_CLEAR}
      </KkButton>
    );

  return (
    <Stack
      component="nav"
      aria-label={INDEX_TITLE}
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: INDEX_WIDTH,
        flexShrink: 0,
        height,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        containerType: 'inline-size',
        containerName: COLUMN_CONTAINER,
      }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 3 }}>
        <KkPanel variant="block">
          <Stack sx={{ gap: 0.25, minWidth: 0, alignItems: 'flex-start' }}>
            <KkHeading level={4} component="h2">
              {INDEX_TITLE}
            </KkHeading>
            {status}
          </Stack>
        </KkPanel>
      </Box>
      <Box sx={LIST_SX}>
        <SeasonIndexList keyPrefix="" />
      </Box>
    </Stack>
  );
};
