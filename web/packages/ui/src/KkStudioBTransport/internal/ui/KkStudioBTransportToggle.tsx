import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioBTransportToggleKind = 'loopStep' | 'loopPart' | 'mirror';

export type KkStudioBTransportToggleLabel = 'always' | 'wide';

const GLYPHS = {
  loopStep: RepeatOneRoundedIcon,
  loopPart: RepeatRoundedIcon,
  mirror: FlipRoundedIcon,
} as const;

const togglePaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: '2.25rem',
    minWidth: '2.25rem',
    px: 0.75,
    borderRadius: `${kkTokens.radius.pill}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: palette.divider,
    color: palette.text.secondary,
    transition:
      'color 160ms ease-out, border-color 160ms ease-out, background-color 160ms ease-out',
    '&[aria-pressed="true"]': {
      ...redInk(theme),
      borderColor: palette.primary.main,
      backgroundColor: palette.action.selected,
    },
    '@media (hover: hover)': {
      '&:hover:not([aria-pressed="true"])': { color: palette.text.primary },
    },
    ...focusRing(theme),
  };
};

const GLYPH = { width: '1.125rem', height: '1.125rem' } as const;

const LABEL_DISPLAY: Record<KkStudioBTransportToggleLabel, CSSObject['display']> = {
  always: 'inline',
  wide: 'none',
};

const labelPaint = (shown: KkStudioBTransportToggleLabel) =>
  ({
    display: { xs: LABEL_DISPLAY[shown], md: 'inline' },
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  }) as const;

interface KkStudioBTransportToggleProps {
  kind: KkStudioBTransportToggleKind;
  label: string;
  pressed: boolean;
  disabled?: boolean;
  labelShown?: KkStudioBTransportToggleLabel;
  onToggle: () => void;
}

export const KkStudioBTransportToggle: FC<KkStudioBTransportToggleProps> = ({
  kind,
  label,
  pressed,
  disabled = false,
  labelShown = 'always',
  onToggle,
}) => {
  const Glyph = GLYPHS[kind];

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onToggle}
      data-kk-studio-b-toggle={kind}
      sx={togglePaint}
    >
      <Glyph aria-hidden sx={GLYPH} />
      <Box component="span" aria-hidden sx={labelPaint(labelShown)}>
        {label}
      </Box>
    </ButtonBase>
  );
};
