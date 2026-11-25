import { KkStartTile } from '@furria/ui/KkStartTile';
import type { KkStartTileMarkKind } from '@furria/ui/KkStartTileMark';
import type { FC } from 'react';

const TILE_LABEL = 'Kalender';
const HEAD_LABEL = 'KALENDER';
const RING_CAPTION = 'offen';
const RING_LABEL = '2 Antworten offen';
const FIRST_TILE = 0;

interface SampleRow {
  key: string;
  day: string;
  time: string;
  title: string;
  mark: KkStartTileMarkKind;
}

const SAMPLE_ROWS: readonly SampleRow[] = [
  { key: 'opening', day: 'SA', time: '11:11', title: 'Sessionseröffnung', mark: 'owed' },
  { key: 'training', day: 'DI', time: '19:00', title: 'Training', mark: 'yes' },
  { key: 'meeting', day: 'FR', time: '20:00', title: 'Gruppentreffen', mark: 'maybe' },
];

const keep = (): void => {};

export const StartHelpCalendarPreview: FC = () => {
  const rows = SAMPLE_ROWS.map((row) => (
    <KkStartTile.Row
      key={row.key}
      day={row.day}
      dayTone="plain"
      time={row.time}
      title={row.title}
      trailing={<KkStartTile.Mark kind={row.mark} label={row.title} />}
      label={row.title}
      onClick={keep}
    />
  ));

  return (
    <KkStartTile label={TILE_LABEL} order={FIRST_TILE}>
      <KkStartTile.Head icon="calendar" label={HEAD_LABEL} />
      <KkStartTile.Ring
        owed={2}
        answered={3}
        caption={RING_CAPTION}
        label={RING_LABEL}
        onClick={keep}
      />
      <KkStartTile.Rows>{rows}</KkStartTile.Rows>
    </KkStartTile>
  );
};
