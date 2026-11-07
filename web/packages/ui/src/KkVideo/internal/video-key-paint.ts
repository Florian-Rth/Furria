import type { CSSObject, Theme } from '@mui/material/styles';
import type { PointerEvent } from 'react';
import { focusRing } from '../../internal/focus-ring';
import { kkTokens } from '../../tokens';

export const keepGesture = (event: PointerEvent<HTMLButtonElement>): void => {
  event.stopPropagation();
};

export const glassOf = (share: number): string =>
  `color-mix(in srgb, ${kkTokens.overlay.scrimInk} ${share}%, transparent)`;

export const roundKeyPaint = (theme: Theme): CSSObject => ({
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: kkTokens.overlay.onPhotoText,
  backgroundColor: glassOf(42),
  backdropFilter: `blur(${kkTokens.glass.blur})`,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.95)' },
  ...focusRing(theme),
});

export const pillKeyPaint = (theme: Theme): CSSObject => ({
  gap: theme.spacing(0.5),
  height: kkTokens.tapTarget,
  paddingInline: theme.spacing(1.25),
  borderRadius: `${kkTokens.radius.pill}px`,
  ...theme.typography.caption,
  fontWeight: 800,
  color: kkTokens.overlay.onPhotoText,
  backdropFilter: `blur(${kkTokens.glass.blur})`,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.95)' },
  ...focusRing(theme),
});
