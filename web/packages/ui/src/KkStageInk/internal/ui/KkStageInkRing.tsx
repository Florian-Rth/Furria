import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { NARROW_FIELD } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStageInkRing: FC = () => (
  <Box
    aria-hidden
    data-kk-stage-ring
    sx={(theme) => ({
      width: { xs: '2.25rem', desktop: '3rem' },
      height: { xs: '2.25rem', desktop: '3rem' },
      [NARROW_FIELD]: { width: '1.75rem', height: '1.75rem' },
      boxSizing: 'border-box',
      borderRadius: '50%',
      border: `${kkTokens.line.section}px dashed ${palette(theme).primary.main}`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
    })}
  />
);
