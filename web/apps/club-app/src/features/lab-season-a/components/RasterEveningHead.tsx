import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import {
  RUNNING_ORDER_CONFIRMED,
  RUNNING_ORDER_NONE,
  RUNNING_ORDER_OPEN,
  toEveningDay,
  toEveningTally,
} from '../season-a-copy';
import { eveningTallyOf } from '../season-raster';

interface RasterEveningHeadProps {
  evening: SeasonEvening;
  acts: readonly SeasonAct[];
}

const orderStateOf = (evening: SeasonEvening): string => {
  if (!evening.hasRunningOrder) {
    return RUNNING_ORDER_NONE;
  }

  return evening.confirmed ? RUNNING_ORDER_CONFIRMED : RUNNING_ORDER_OPEN;
};

export const RasterEveningHead: FC<RasterEveningHeadProps> = ({ evening, acts }) => {
  const tally = eveningTallyOf(acts, evening.eventId);
  const tone = evening.confirmed ? 'green' : 'neutral';
  const day = toEveningDay(evening.startsAt);
  const tallyText = toEveningTally(tally.placed, tally.tray);
  const orderState = orderStateOf(evening);

  return (
    <Stack sx={{ minWidth: 0, scrollSnapAlign: 'start' }}>
      <Stack sx={{ flex: 1, justifyContent: 'flex-end', gap: 0.25, px: 1, pb: 1, minWidth: 0 }}>
        <KkEyebrow tone="muted">{day}</KkEyebrow>
        <KkText variant="subtitle2" clamp={2}>
          {evening.title}
        </KkText>
        <KkMeta lines={1}>{tallyText}</KkMeta>
        <Stack direction="row">
          <KkChip tone={tone} size="small">
            {orderState}
          </KkChip>
        </Stack>
      </Stack>
      <KkRule weight="section" />
    </Stack>
  );
};
