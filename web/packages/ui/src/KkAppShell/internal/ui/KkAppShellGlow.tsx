import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

type KkAppShellGlowTone = 'red' | 'gold';

interface KkAppShellGlowProps {
  tone: KkAppShellGlowTone;
  width: number;
  height: number;
  top: number;
  right?: number;
  centred?: boolean;
}

const glowColor = {
  red: { light: kkTokens.chrome.light.glowRed, dark: kkTokens.chrome.dark.glowRed },
  gold: { light: kkTokens.chrome.light.glowGold, dark: kkTokens.chrome.dark.glowGold },
} as const;

export const KkAppShellGlow: FC<KkAppShellGlowProps> = ({
  tone,
  width,
  height,
  top,
  right,
  centred = false,
}) => {
  const placement = centred
    ? { left: '50%', transform: 'translateX(-50%)' }
    : { right, transform: 'none' };

  return (
    <Box
      aria-hidden
      data-kk-app-shell-glow
      sx={(theme) => ({
        position: 'absolute',
        top,
        width,
        height,
        ...placement,
        backgroundImage: `radial-gradient(closest-side, ${glowColor[tone].light}, transparent)`,
        ...theme.applyStyles('dark', {
          backgroundImage: `radial-gradient(closest-side, ${glowColor[tone].dark}, transparent)`,
        }),
        pointerEvents: 'none',
        zIndex: -1,
      })}
    />
  );
};
