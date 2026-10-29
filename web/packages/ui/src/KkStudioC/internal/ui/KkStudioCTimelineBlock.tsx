import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { focusRing } from '../../../internal/focus-ring';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import type { KkStudioCBlockState } from '../../studio-c-types';
import { stickyLabelOf } from '../sticky-label';

export type KkStudioCBlockKind = 'part' | 'step';

const INSET = 2;

const statePaint = (
  theme: Theme,
  kind: KkStudioCBlockKind,
  state: KkStudioCBlockState,
): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  switch (state) {
    case 'looped':
      return { ...accentWash(theme), ...redInk(theme), borderColor: palette.primary.main };
    case 'current':
      return {
        backgroundColor: palette.background.paper,
        ...redInk(theme),
        borderColor: palette.primary.main,
      };
    case 'idle':
      return kind === 'part'
        ? {
            ...inkWashSurface(theme, '7%', '10%'),
            color: palette.text.primary,
            borderColor: 'transparent',
          }
        : {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            borderColor: palette.divider,
          };
  }
};

const blockPaint =
  (kind: KkStudioCBlockKind, state: KkStudioCBlockState) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    justifyContent: 'flex-start',
    alignItems: kind === 'step' ? 'flex-start' : 'center',
    flexDirection: kind === 'step' ? 'column' : 'row',
    gap: theme.spacing(0.5),
    px: 0.75,
    py: kind === 'step' ? 0.375 : 0,
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1.2,
    transition:
      'background-color 160ms ease-out, color 160ms ease-out, border-color 160ms ease-out',
    ...(kind === 'part'
      ? { textTransform: 'uppercase', letterSpacing: kkTokens.type.tracking.label }
      : {}),
    ...statePaint(theme, kind, state),
    ...focusRing(theme),
  });

const ONE_LINE: CSSObject = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

interface KkStudioCTimelineBlockProps {
  kind: KkStudioCBlockKind;
  left: number;
  width: number;
  number: string | null;
  name: string;
  meta: string | null;
  state: KkStudioCBlockState;
  label: string;
  onSelect: () => void;
}

export const KkStudioCTimelineBlock: FC<KkStudioCTimelineBlockProps> = ({
  kind,
  left,
  width,
  number,
  name,
  meta,
  state,
  label,
  onSelect,
}) => {
  const place = { left, width };
  const sticky = stickyLabelOf(left, width);
  const figure =
    number === null ? null : (
      <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', opacity: 0.7 }}>
        {number}
      </Box>
    );
  const loopGlyph = state === 'looped' ? <RepeatOneRoundedIcon fontSize="inherit" /> : null;
  const detail =
    meta === null ? null : (
      <Box
        component="span"
        style={sticky}
        sx={{ fontWeight: 700, opacity: 0.72, fontVariantNumeric: 'tabular-nums', ...ONE_LINE }}
      >
        {meta}
      </Box>
    );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={state === 'looped'}
      onClick={onSelect}
      data-kk-studio-c-block={kind}
      data-state={state}
      style={place}
      sx={blockPaint(kind, state)}
    >
      <Box component="span" style={sticky} sx={ONE_LINE}>
        {loopGlyph}
        {figure}
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </Box>
      </Box>
      {detail}
    </ButtonBase>
  );
};
