import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { redInk } from '../internal/red-ink';
import { kkTokens } from '../tokens';
import { studioFGlass } from './internal/logic/studio-f-glass';

const CHIP_HEIGHT = '2.5rem';

const mirrorPaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    height: CHIP_HEIGHT,
    gap: 0.5,
    px: 1.5,
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'caption',
    fontWeight: 800,
    color: (theme.vars ?? theme).palette.text.secondary,
    ...studioFGlass(theme),
    ...(pressed ? redInk(theme) : {}),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: `calc((${kkTokens.tapTarget} - ${CHIP_HEIGHT}) / -2) 0`,
    },
    ...focusRing(theme),
  });

interface KkStudioFMirrorProps {
  label: string;
  pressed: boolean;
  onToggle: () => void;
}

export const KkStudioFMirror: FC<KkStudioFMirrorProps> = ({ label, pressed, onToggle }) => (
  <ButtonBase
    aria-pressed={pressed}
    onClick={onToggle}
    data-kk-studio-f-mirror
    sx={mirrorPaint(pressed)}
  >
    <FlipRoundedIcon fontSize="small" />
    {label}
  </ButtonBase>
);
