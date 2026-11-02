import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStageInkKey: FC = () => (
  <Box
    aria-hidden
    data-kk-stage-key
    sx={(theme) => ({
      width: '0.5rem',
      height: '0.5rem',
      boxSizing: 'border-box',
      transform: 'rotate(45deg)',
      backgroundColor: palette(theme).background.paper,
      border: `${kkTokens.line.section}px solid ${palette(theme).primary.main}`,
    })}
  />
);
