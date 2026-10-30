import { KkNumberedList } from '@furria/ui/KkNumberedList';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ABSENT_TITLE, EMPTY_EVENING, TRAY_TITLE } from '../season-b-copy';
import type { EveningColumn } from '../season-columns';
import { COLUMN_CONTAINER } from '../season-layout';
import { SeasonAbsentRow } from './SeasonAbsentRow';
import { SeasonEveningHead } from './SeasonEveningHead';
import { SeasonLineRow } from './SeasonLineRow';

interface SeasonEveningColumnProps {
  column: EveningColumn;
  position: number;
  total: number;
}

const LIST_SX = { mt: 0.75 };
const COLUMN_WIDTH = { xs: '100cqw', md: '19.5rem' };

export const SeasonEveningColumn: FC<SeasonEveningColumnProps> = ({ column, position, total }) => {
  const evening = column.evening;
  const lines = column.lines.map((line) => (
    <SeasonLineRow key={line.key} evening={evening} line={line} />
  ));
  const empty =
    column.lines.length === 0 ? <KkNumberedList.Empty>{EMPTY_EVENING}</KkNumberedList.Empty> : null;
  const trayHead =
    column.tray.length === 0 ? null : (
      <KkNumberedList.Section title={TRAY_TITLE} meta={column.tray.length} />
    );
  const tray = column.tray.map((line) => (
    <SeasonLineRow key={line.key} evening={evening} line={line} />
  ));
  const absentHead =
    column.absent.length === 0 ? null : (
      <KkNumberedList.Section title={ABSENT_TITLE} meta={column.absent.length} />
    );
  const absent = column.absent.map((entry) => (
    <SeasonAbsentRow key={entry.key} evening={evening} entry={entry} />
  ));

  return (
    <Stack
      component="section"
      aria-label={evening.title}
      sx={{
        width: COLUMN_WIDTH,
        flexShrink: 0,
        minWidth: 0,
        scrollSnapAlign: 'start',
        containerType: 'inline-size',
        containerName: COLUMN_CONTAINER,
      }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 3 }}>
        <SeasonEveningHead column={column} position={position} total={total} />
      </Box>
      <KkNumberedList label={evening.title} sx={LIST_SX}>
        {lines}
        {empty}
        {trayHead}
        {tray}
        {absentHead}
        {absent}
      </KkNumberedList>
    </Stack>
  );
};
