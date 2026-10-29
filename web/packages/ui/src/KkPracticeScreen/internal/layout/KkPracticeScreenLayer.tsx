import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type KkPracticeScreenTone = 'ink' | 'paper' | 'clear';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const HIDE = `opacity 420ms ease-out, transform 520ms ${EASE}, visibility 0s linear 520ms`;
const SHOW = `opacity 420ms ease-out 120ms, transform 520ms ${EASE}, visibility 0s`;

const toneOf = (theme: Theme, tone: KkPracticeScreenTone): string => {
  if (tone === 'ink') {
    return kkTokens.overlay.scrimInk;
  }

  return tone === 'paper' ? (theme.vars ?? theme).palette.background.paper : 'transparent';
};

interface KkPracticeScreenLayerProps extends PropsWithChildren {
  shown: boolean;
  tone: KkPracticeScreenTone;
}

export const KkPracticeScreenLayer: FC<KkPracticeScreenLayerProps> = ({
  shown,
  tone,
  children,
}) => (
  <Box
    aria-hidden={!shown}
    data-shown={shown}
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'inherit',
      overflow: 'clip',
      containerType: 'size',
      backgroundColor: toneOf(theme, tone),
      opacity: 0,
      visibility: 'hidden',
      transform: 'scale(0.96)',
      transition: HIDE,
      '&[data-shown="true"]': {
        opacity: 1,
        visibility: 'visible',
        transform: 'none',
        transition: SHOW,
      },
      '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
    })}
  >
    {children}
  </Box>
);
