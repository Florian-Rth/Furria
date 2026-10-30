import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesPlayheadProps {
  share: number;
}

export const KkFocusLanesPlayhead: FC<KkFocusLanesPlayheadProps> = ({ share }) => (
  <Box
    aria-hidden
    data-kk-focus-playhead
    style={{ left: `${share * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: kkTokens.line.section,
      transform: 'translateX(-50%)',
      backgroundColor: palette(theme).primary.main,
      pointerEvents: 'none',
      zIndex: 5,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: '0.375rem solid transparent',
        borderRight: '0.375rem solid transparent',
        borderTop: `0.5rem solid ${palette(theme).primary.main}`,
      },
    })}
  />
);
