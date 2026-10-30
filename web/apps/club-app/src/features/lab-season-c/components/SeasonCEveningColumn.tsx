import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import { KkStatePill } from '@furria/ui/KkStatePill';
import { KkText } from '@furria/ui/KkText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCEvening, SeasonCRow } from '../hooks/use-season-c';
import { SPOT_ATTRIBUTE } from '../hooks/use-season-c-keys';
import { CONFIRMED, NOT_CONFIRMED } from '../season-c-copy';
import { spotKeyOf } from '../season-c-keys';
import { EVENING_WIDTH, HEAD_HEIGHT, PHONE_ONLY, ROW_HEIGHT } from '../season-c-layout';
import { SeasonCDot } from './SeasonCDot';

interface SeasonCEveningColumnProps {
  evening: SeasonCEvening;
  column: number;
  rows: readonly SeasonCRow[];
}

export const SeasonCEveningColumn: FC<SeasonCEveningColumnProps> = ({ evening, column, rows }) => {
  const confirmedState = evening.confirmed ? 'done' : 'open';
  const confirmedLabel = evening.confirmed ? CONFIRMED : NOT_CONFIRMED;
  const dots = rows.map((row, index) => {
    const dot = row.dots[column - 1];
    const cell = dot === undefined ? null : <SeasonCDot dot={dot} />;

    return (
      <Box key={row.actId}>
        <Box
          {...{ [SPOT_ATTRIBUTE]: spotKeyOf({ row: index, column }) }}
          sx={{ height: ROW_HEIGHT, display: 'grid', placeItems: 'center' }}
        >
          {cell}
        </Box>
        <KkRule weight="hair" />
      </Box>
    );
  });

  return (
    <Stack
      role="group"
      aria-label={evening.title}
      sx={{ width: EVENING_WIDTH, flexShrink: 0, scrollSnapAlign: 'start', minWidth: 0 }}
    >
      <Stack
        sx={{
          height: HEAD_HEIGHT,
          justifyContent: 'flex-end',
          gap: 0.25,
          px: 0.75,
          pb: 0.75,
          minWidth: 0,
          '& > *': { flexShrink: 0 },
        }}
      >
        <KkMeta lines={1} sx={{ display: PHONE_ONLY }}>
          {evening.place}
        </KkMeta>
        <KkEyebrow tone="accent">{evening.day}</KkEyebrow>
        <KkText variant="caption" clamp={2}>
          {evening.title}
        </KkText>
        <KkMeta lines={1}>{evening.count}</KkMeta>
        <KkStatePill state={confirmedState} label={confirmedLabel} sx={{ ml: 0 }} />
      </Stack>
      <KkRule weight="section" />
      {dots}
    </Stack>
  );
};
