import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkHandleProps {
  active: boolean;
}

export const KkStageInkHandle: FC<KkStageInkHandleProps> = ({ active }) => (
  <Box
    aria-hidden
    data-kk-stage-handle
    data-active={active}
    sx={(theme) => ({
      width: '0.875rem',
      height: '0.875rem',
      boxSizing: 'border-box',
      borderRadius: '50%',
      backgroundColor: palette(theme).background.paper,
      border: `${kkTokens.line.section}px solid ${palette(theme).primary.main}`,
      boxShadow: kkTokens.shadow.rest,
      transition: 'transform 160ms ease-out, background-color 160ms ease-out',
      '&[data-active="true"]': {
        transform: 'scale(1.4)',
        backgroundColor: palette(theme).primary.main,
      },
    })}
  />
);
