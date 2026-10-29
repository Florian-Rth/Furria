import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const togglePaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    paddingInline: theme.spacing(1.25),
    borderRadius: `${kkTokens.radius.pill}px`,
    ...theme.typography.caption,
    fontWeight: 800,
    color: (theme.vars ?? theme).palette.text.secondary,
    ...(pressed ? { ...accentWash(theme), ...redInk(theme) } : {}),
    ...focusRing(theme),
  });

interface KkStudioEVideoMirrorProps {
  text: string;
  mirrored: boolean;
  onToggle: () => void;
}

export const KkStudioEVideoMirror: FC<KkStudioEVideoMirrorProps> = ({
  text,
  mirrored,
  onToggle,
}) => (
  <ButtonBase aria-pressed={mirrored} onClick={onToggle} sx={togglePaint(mirrored)}>
    <FlipRoundedIcon fontSize="small" />
    {text}
  </ButtonBase>
);
