import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkFocusLane } from '../lane-heights';
import { LANE_HEIGHTS } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesRowProps extends PropsWithChildren {
  lane: KkFocusLane;
  label: string;
}

export const KkFocusLanesRow: FC<KkFocusLanesRowProps> = ({ lane, label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-focus-lane={lane}
    sx={(theme) => ({
      position: 'relative',
      height: LANE_HEIGHTS[lane],
      borderBottom: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
      '&:last-of-type': { borderBottom: 'none' },
    })}
  >
    {children}
  </Box>
);
