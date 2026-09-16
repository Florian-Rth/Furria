import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { toneRecipes } from '../../../internal/tone';
import { kkTokens } from '../../../tokens';
import type { KkScreenThread } from '../../screen-declaration';

const { threadHeight } = kkTokens.shell;
const THREAD_INSET = `${kkTokens.radius.base}px`;
const THREAD_RADIUS = `${kkTokens.radius.bar}px`;
const TRACK_OPACITY = 0.16;

interface KkShellThreadProps {
  thread: KkScreenThread;
}

export const KkShellThread: FC<KkShellThreadProps> = ({ thread }) => {
  const recipe = toneRecipes[thread.tone];
  const filled = Math.round(Math.min(Math.max(thread.value, 0), 1) * 100);

  return (
    <Box
      role="progressbar"
      aria-label={thread.label}
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={100}
      data-kk-shell-thread
      sx={(theme) => ({
        position: 'absolute',
        left: THREAD_INSET,
        right: THREAD_INSET,
        bottom: 0,
        height: `${threadHeight}px`,
        borderRadius: THREAD_RADIUS,
        pointerEvents: 'none',
        ...applyScheme(
          theme,
          schemeFill(alpha(recipe.inkLight, TRACK_OPACITY), alpha(recipe.inkDark, TRACK_OPACITY)),
        ),
      })}
    >
      <Box
        sx={(theme) => ({
          width: `${filled}%`,
          height: '100%',
          borderRadius: THREAD_RADIUS,
          ...applyScheme(theme, schemeFill(recipe.inkLight, recipe.inkDark)),
        })}
      />
    </Box>
  );
};
