import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHPlayheadProps {
  share: number;
}

export const KkStudioHPlayhead: FC<KkStudioHPlayheadProps> = ({ share }) => (
  <Box
    aria-hidden
    data-kk-studio-h-playhead
    style={{ left: `${share * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: kkTokens.line.section,
      ml: `-${kkTokens.line.section / 2}px`,
      backgroundColor: palette(theme).primary.main,
      pointerEvents: 'none',
      zIndex: 3,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        width: '0.625rem',
        height: '0.625rem',
        borderRadius: '50%',
        transform: 'translate(-50%, -40%)',
        backgroundColor: palette(theme).primary.main,
      },
    })}
  />
);
