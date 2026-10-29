import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioCToggleGlyph = 'loop' | 'mirror' | 'video';

const GLYPHS: Record<KkStudioCToggleGlyph, ReactNode> = {
  loop: <RepeatOneRoundedIcon fontSize="small" />,
  mirror: <FlipRoundedIcon fontSize="small" />,
  video: <VideocamRoundedIcon fontSize="small" />,
};

const togglePaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    minWidth: '2.5rem',
    height: '2.25rem',
    px: 1,
    borderRadius: `${kkTokens.radius.pill}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: pressed ? 'transparent' : (theme.vars ?? theme).palette.divider,
    typography: 'caption',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...(pressed ? { ...accentWash(theme), ...redInk(theme) } : {}),
    '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
    ...focusRing(theme),
  });

interface KkStudioCTransportToggleProps {
  glyph: KkStudioCToggleGlyph;
  label: string;
  text: string;
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioCTransportToggle: FC<KkStudioCTransportToggleProps> = ({
  glyph,
  label,
  text,
  pressed,
  disabled = false,
  onToggle,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onToggle}
    data-kk-studio-c-toggle={glyph}
    sx={togglePaint(pressed)}
  >
    {GLYPHS[glyph]}
    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
      {text}
    </Box>
  </ButtonBase>
);
