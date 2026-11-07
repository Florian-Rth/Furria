import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkTimelineRowKind } from '../timeline-paint';
import {
  EMPTY_ROW_VARS,
  keysTop,
  LANE_VARS,
  stepsTop,
  videosTop,
  waveBottom,
  waveTop,
} from '../timeline-paint';

export type KkTimelineRowPlace = Exclude<KkTimelineRowKind, 'ruler' | 'parts'> | 'wave';

const PLACES: Record<KkTimelineRowPlace, { top: string; height: string }> = {
  wave: { top: waveTop, height: `calc(100% - ${waveTop} - ${waveBottom})` },
  steps: { top: stepsTop, height: `var(${LANE_VARS.steps})` },
  videos: { top: videosTop, height: `var(${LANE_VARS.videos})` },
  keys: { top: keysTop, height: `var(${LANE_VARS.keys})` },
};

interface KkTimelineRowProps extends PropsWithChildren {
  row: KkTimelineRowPlace;
  lane?: string;
  label?: string;
}

export const KkTimelineRow: FC<KkTimelineRowProps> = ({ row, lane, label, children }) => {
  const place = PLACES[row];
  const role = label === undefined ? undefined : 'group';

  return (
    <Box
      role={role}
      aria-label={label}
      data-timeline-lane={lane}
      data-kk-timeline-row={row}
      style={place}
      sx={{ position: 'absolute', left: 0, right: 0 }}
    >
      <Box sx={{ ...EMPTY_ROW_VARS, position: 'absolute', inset: 0 }}>{children}</Box>
    </Box>
  );
};
