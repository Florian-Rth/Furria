import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkScheme } from '../../../internal/scheme-paint';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

const scrimScheme: KkScheme = {
  light: { backgroundImage: kkTokens.color.light.photoScrim },
  dark: { backgroundImage: kkTokens.color.dark.photoScrim },
};

export const KkGroupStageScrim: FC = () => (
  <Box
    aria-hidden
    data-kk-group-stage-scrim
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      ...applyScheme(theme, scrimScheme),
    })}
  />
);
