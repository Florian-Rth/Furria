import { KkButton } from '@furria/ui/KkButton';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonBoard } from '../hooks/use-season-board';
import { INDEX_OPEN_LABEL, SESSIONS_LABEL } from '../season-b-copy';

interface SeasonToolsProps {
  board: SeasonBoard;
}

export const SeasonTools: FC<SeasonToolsProps> = ({ board }) => {
  const indexLabel = board.markedName ?? INDEX_OPEN_LABEL;

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
      <KkChoiceChips
        label={SESSIONS_LABEL}
        choices={board.sessionChoices}
        value={board.sessionValue}
        onChange={board.chooseSession}
      />
      <Box sx={{ display: { xs: 'block', md: 'none' }, minWidth: 0 }}>
        <KkButton size="small" variant="outlined" onClick={board.openIndex}>
          {indexLabel}
        </KkButton>
      </Box>
    </Stack>
  );
};
