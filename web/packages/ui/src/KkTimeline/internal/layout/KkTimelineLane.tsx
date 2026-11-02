import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkTimelineLaneSize } from '../lane-sizes';
import { LANE_HEIGHTS } from '../lane-sizes';
import { LANE_VARS } from '../timeline-paint';

interface KkTimelineLaneProps extends PropsWithChildren {
  lane: string;
  label: string;
  size: KkTimelineLaneSize;
}

export const KkTimelineLane: FC<KkTimelineLaneProps> = ({ lane, label, size, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-timeline-lane={lane}
    data-kk-timeline-lane={size}
    sx={{
      [LANE_VARS.ruler]: size === 'ruler' ? '100%' : '0rem',
      [LANE_VARS.parts]: '0rem',
      [LANE_VARS.steps]: '0rem',
      position: 'relative',
      flexShrink: 0,
      height: LANE_HEIGHTS[size],
      borderBottomWidth: kkTokens.line.hair,
      borderBottomStyle: 'solid',
      borderBottomColor: 'divider',
    }}
  >
    {children}
  </Box>
);
