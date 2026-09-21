import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldScheme } from './internal/group-tone';
import { applyScheme } from './internal/scheme-paint';

const DOT_SIZE = 7;

interface KkGroupToneDotProps {
  tone: KkGroupTone | null;
}

export const KkGroupToneDot: FC<KkGroupToneDotProps> = ({ tone }) => (
  <Box
    aria-hidden
    component="span"
    data-kk-group-tone-dot
    sx={(theme) => ({
      display: 'inline-flex',
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: '50%',
      flexShrink: 0,
      backgroundColor: 'text.secondary',
      ...(tone === null ? {} : applyScheme(theme, groupToneFieldScheme(tone))),
    })}
  />
);
