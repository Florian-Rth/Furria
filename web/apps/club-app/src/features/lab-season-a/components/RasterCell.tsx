import { KkChip } from '@furria/ui/KkChip';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import { cellOf } from '@/features/season/season-grid';
import { SPOT_ATTRIBUTE } from '../hooks/use-raster-keys';
import type { SeasonA } from '../hooks/use-season-a';
import { ADD_TO_EVENING, toCellLabel, toCellText, toDetailsLabel } from '../season-a-copy';
import type { RasterSpot } from '../season-raster';
import { spotKeyOf } from '../season-raster';

interface RasterCellProps {
  act: SeasonAct;
  evening: SeasonEvening;
  spot: RasterSpot;
  season: SeasonA;
}

const PENDING_TEXT = '…';

export const RasterCell: FC<RasterCellProps> = ({ act, evening, spot, season }) => {
  const cell = cellOf(act, evening.eventId);
  const label = toCellLabel(act.name, evening.title, cell);
  const detailsLabel = toDetailsLabel(act.name, evening.title);
  const pending = season.isToggling(act.actId, evening.eventId);
  const selected =
    season.selection?.actId === act.actId && season.selection.eventId === evening.eventId;
  const holder = { [SPOT_ATTRIBUTE]: spotKeyOf(spot) };
  const toggle = (): void => {
    season.toggle(act, evening);
  };
  const open = (): void => {
    season.open(spot);
  };
  const mainTone = cell.state === 'placed' ? 'ink' : 'quiet';
  const filledText = pending ? PENDING_TEXT : toCellText(cell);
  const main =
    cell.state === 'none' ? (
      <KkLaneButton
        text={ADD_TO_EVENING}
        label={label}
        glyph="add"
        textShown={false}
        pressed={pending}
        onPress={toggle}
      />
    ) : (
      <KkLaneButton text={filledText} label={label} tone={mainTone} onPress={toggle} />
    );
  const adjusted = cell.adjusted ? <KkChip tone="gold" size="small" dot /> : null;
  const details =
    cell.state === 'none' ? null : (
      <KkLaneButton
        text={detailsLabel}
        glyph="spots"
        textShown={false}
        tone="quiet"
        pressed={selected}
        onPress={open}
      />
    );

  return (
    <Stack
      direction="row"
      {...holder}
      sx={{
        alignItems: 'center',
        gap: 0.5,
        px: 0.75,
        minWidth: 0,
        scrollSnapAlign: 'start',
      }}
    >
      {main}
      {adjusted}
      {details}
    </Stack>
  );
};
