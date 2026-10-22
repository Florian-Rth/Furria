import { KkMeta } from '@furria/ui/KkMeta';
import { KkStartTile } from '@furria/ui/KkStartTile';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useCalendarTile } from '../hooks/use-calendar-tile';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';
import { CalendarLead } from './CalendarLead';
import { EntryMark } from './EntryMark';

const TILE_LABEL = 'Kalender';
const HEAD_LABEL = 'KALENDER';
const RING_CAPTION = 'offen';

interface CalendarTileProps {
  panel: StartPanelOf<'calendar'>;
  board: StartBoard;
  order: number;
}

export const CalendarTile: FC<CalendarTileProps> = ({ panel, board, order }) => {
  const tile = useCalendarTile(panel, board);
  const lead = tile.lead === null ? null : <CalendarLead lead={tile.lead} />;
  const ring =
    tile.ring === null ? null : (
      <KkStartTile.Ring
        owed={tile.ring.owed}
        answered={tile.ring.answered}
        caption={RING_CAPTION}
        label={tile.ring.label}
        onClick={tile.ring.open}
      />
    );
  const rows = tile.rows.map((row) => (
    <KkStartTile.Row
      key={row.key}
      day={row.day}
      dayTone={row.dayTone}
      time={row.time}
      title={row.title}
      tick={row.tick}
      trailing={<EntryMark mark={row.mark} />}
      label={row.label}
      onClick={row.open}
    />
  ));
  const rowList = rows.length === 0 ? null : <KkStartTile.Rows>{rows}</KkStartTile.Rows>;
  const further = tile.further === null ? null : <KkMeta>{tile.further}</KkMeta>;

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="calendar" label={HEAD_LABEL} reach={tile.reach} />
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
        {lead}
        {ring}
      </Stack>
      {rowList}
      {further}
    </KkStartTile>
  );
};
