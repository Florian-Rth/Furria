import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonBoard } from '../hooks/use-season-board';
import { useSeasonKeys } from '../hooks/use-season-keys';
import { GRID_LABEL } from '../season-b-copy';
import { SeasonBoardContext } from '../season-board-context';
import { BOARD_HEIGHT } from '../season-layout';
import { SeasonEveningColumn } from './SeasonEveningColumn';
import { SeasonIndexColumn } from './SeasonIndexColumn';
import { SeasonIndexSheet } from './SeasonIndexSheet';

interface SeasonBoardViewProps {
  board: SeasonBoard;
}

export const SeasonBoardView: FC<SeasonBoardViewProps> = ({ board }) => {
  const keysRef = useSeasonKeys(board.grid);
  const columns = board.columns.map((column, index) => (
    <SeasonEveningColumn
      key={column.evening.eventId}
      column={column}
      position={index + 1}
      total={board.columns.length}
    />
  ));

  return (
    <SeasonBoardContext.Provider value={board}>
      <Stack ref={keysRef} direction="row" sx={{ gap: 1.5, minWidth: 0, alignItems: 'flex-start' }}>
        <SeasonIndexColumn height={BOARD_HEIGHT} />
        <Box
          role="region"
          aria-label={GRID_LABEL}
          sx={{
            flex: 1,
            minWidth: 0,
            height: BOARD_HEIGHT,
            overflow: 'auto',
            overscrollBehavior: 'contain',
            containerType: 'inline-size',
            scrollSnapType: { xs: 'x mandatory', md: 'none' },
          }}
        >
          <Stack direction="row" sx={{ gap: 1.5, width: 'max-content', alignItems: 'flex-start' }}>
            {columns}
          </Stack>
        </Box>
      </Stack>
      <SeasonIndexSheet />
    </SeasonBoardContext.Provider>
  );
};
