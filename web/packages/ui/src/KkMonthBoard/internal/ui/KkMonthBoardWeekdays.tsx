import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { MONTH_BOARD_COLUMNS } from '../logic/month-board-grid';

interface KkMonthBoardWeekdaysProps {
  weekdays: readonly string[];
}

export const KkMonthBoardWeekdays: FC<KkMonthBoardWeekdaysProps> = ({ weekdays }) => (
  <Box aria-hidden sx={{ display: 'grid', gridTemplateColumns: MONTH_BOARD_COLUMNS }}>
    {weekdays.map((weekday) => (
      <Typography
        key={weekday}
        variant="overline"
        sx={{ ...kkTokens.eyebrow, color: 'text.secondary', textAlign: 'center' }}
      >
        {weekday}
      </Typography>
    ))}
  </Box>
);
