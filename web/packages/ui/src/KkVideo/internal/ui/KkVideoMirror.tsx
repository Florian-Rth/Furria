import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { glassOf, keepGesture, pillKeyPaint } from '../video-key-paint';

const mirrorPaint =
  (mirrored: boolean) =>
  (theme: Theme): CSSObject => ({
    ...pillKeyPaint(theme),
    backgroundColor: mirrored ? glassOf(58) : glassOf(30),
    opacity: mirrored ? 1 : kkTokens.opacity.dimmed,
    transition: `${kkTokens.motion.press}, opacity 160ms ease-out`,
    '& svg': {
      transition: 'transform 220ms ease-out',
      transform: mirrored ? 'none' : 'scaleX(-1)',
    },
  });

interface KkVideoMirrorProps {
  text: string;
  mirrored: boolean;
  onToggle: () => void;
}

export const KkVideoMirror: FC<KkVideoMirrorProps> = ({ text, mirrored, onToggle }) => (
  <ButtonBase
    aria-pressed={mirrored}
    onClick={onToggle}
    onPointerDown={keepGesture}
    onPointerUp={keepGesture}
    data-kk-video-mirror
    sx={mirrorPaint(mirrored)}
  >
    <FlipRoundedIcon fontSize="small" />
    {text}
  </ButtonBase>
);
