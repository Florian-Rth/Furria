import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const PERCENT = 100;

interface KkFocusOverviewSpanProps {
  start: number;
  end: number;
}

export const KkFocusOverviewSpan: FC<KkFocusOverviewSpanProps> = ({ start, end }) => (
  <Box
    aria-hidden
    style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      bottom: '0.125rem',
      height: kkTokens.line.page,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: palette(theme).info.main,
      pointerEvents: 'none',
    })}
  />
);
