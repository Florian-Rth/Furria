import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PointerEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const mirrorPaint =
  (mirrored: boolean) =>
  (theme: Theme): CSSObject => ({
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    paddingInline: theme.spacing(1.25),
    borderRadius: `${kkTokens.radius.pill}px`,
    ...theme.typography.caption,
    fontWeight: 800,
    color: kkTokens.overlay.onPhotoText,
    backgroundColor: mirrored
      ? `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 58%, transparent)`
      : `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 30%, transparent)`,
    backdropFilter: `blur(${kkTokens.glass.blur})`,
    opacity: mirrored ? 1 : kkTokens.opacity.dimmed,
    transition: `${kkTokens.motion.press}, opacity 160ms ease-out`,
    '&:active': { transform: 'scale(0.95)' },
    '& svg': {
      transition: 'transform 220ms ease-out',
      transform: mirrored ? 'none' : 'scaleX(-1)',
    },
    ...focusRing(theme),
  });

const keepGesture = (event: PointerEvent<HTMLButtonElement>): void => {
  event.stopPropagation();
};

interface KkStudioEScreenMirrorProps {
  text: string;
  mirrored: boolean;
  onToggle: () => void;
}

export const KkStudioEScreenMirror: FC<KkStudioEScreenMirrorProps> = ({
  text,
  mirrored,
  onToggle,
}) => (
  <ButtonBase
    aria-pressed={mirrored}
    onClick={onToggle}
    onPointerDown={keepGesture}
    onPointerUp={keepGesture}
    data-kk-studio-e-mirror
    sx={mirrorPaint(mirrored)}
  >
    <FlipRoundedIcon fontSize="small" />
    {text}
  </ButtonBase>
);
