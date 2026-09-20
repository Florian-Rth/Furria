import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { toneRecipes } from '../../../internal/tone';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const PROGRESS_LABEL = 'Fortschritt der Session';
const TRACK_RADIUS = `${kkTokens.radius.bar}px`;
const TRACK_HEIGHT = `${kkTokens.shell.threadHeight}px`;
const TRACK_OPACITY = 0.16;
const FULL_PERCENT = 100;

const recipe = toneRecipes.accent;

interface KkMottoStageProgressProps {
  progress: number | null;
  sx?: KkSx;
}

export const KkMottoStageProgress: FC<KkMottoStageProgressProps> = ({ progress, sx }) => {
  if (progress === null) {
    return null;
  }

  const filled = Math.round(Math.min(Math.max(progress, 0), 1) * FULL_PERCENT);

  return (
    <Box
      role="progressbar"
      aria-label={PROGRESS_LABEL}
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={FULL_PERCENT}
      data-kk-motto-stage-progress
      sx={[
        (theme) => ({
          width: '100%',
          height: TRACK_HEIGHT,
          borderRadius: TRACK_RADIUS,
          ...applyScheme(
            theme,
            schemeFill(alpha(recipe.inkLight, TRACK_OPACITY), alpha(recipe.inkDark, TRACK_OPACITY)),
          ),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={(theme) => ({
          width: `${filled}%`,
          height: '100%',
          borderRadius: TRACK_RADIUS,
          ...applyScheme(theme, schemeFill(recipe.inkLight, recipe.inkDark)),
        })}
      />
    </Box>
  );
};
