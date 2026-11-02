import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { NARROW_FIELD } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStageInkEcho: FC = () => (
  <Box
    aria-hidden
    data-kk-stage-echo
    sx={(theme) => ({
      width: '1.25rem',
      height: '1.25rem',
      [theme.breakpoints.up('desktop')]: { width: '1.625rem', height: '1.625rem' },
      [NARROW_FIELD]: { width: '0.75rem', height: '0.75rem' },
      boxSizing: 'border-box',
      borderRadius: '50%',
      border: `${kkTokens.line.hair}px dashed ${palette(theme).text.secondary}`,
      opacity: 0.7,
    })}
  />
);
