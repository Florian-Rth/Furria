import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import type { KkStudioIShare } from '../../../KkStudioIDrag/use-kk-studio-i-drag';
import { useKkStudioIDrag } from '../../../KkStudioIDrag/use-kk-studio-i-drag';
import { kkTokens } from '../../../tokens';

export type KkStudioIStageDotKind = 'own' | 'cast' | 'open';

const PERCENT = 100;
const FIELD = '[data-kk-practice-field]';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const paints: Record<KkStudioIStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).text.secondary}, ${kkTokens.shadow.rest}`,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 60%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
  }),
};

interface KkStudioIStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStudioIStageDotKind;
  selected: boolean;
  moved: boolean;
  label: string;
  onPress: () => void;
  onDrag: (share: KkStudioIShare) => void;
}

export const KkStudioIStageDot: FC<KkStudioIStageDotProps> = ({
  x,
  y,
  number,
  kind,
  selected,
  moved,
  label,
  onPress,
  onDrag,
}) => {
  const handlers = useKkStudioIDrag(FIELD, onPress, onDrag);
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };
  const ring = selected ? (
    <Box
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        inset: '-0.3125rem',
        borderRadius: '50%',
        border: `${kkTokens.line.section}px solid ${palette(theme).text.primary}`,
      })}
    />
  ) : null;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      data-kk-studio-i-dot={kind}
      data-selected={selected}
      data-moved={moved}
      {...handlers}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: { xs: 'clamp(1.125rem, 7cqw, 1.625rem)', desktop: 'clamp(1.25rem, 5cqw, 2.125rem)' },
        height: {
          xs: 'clamp(1.125rem, 7cqw, 1.625rem)',
          desktop: 'clamp(1.25rem, 5cqw, 2.125rem)',
        },
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'auto',
        touchAction: 'none',
        cursor: 'grab',
        zIndex: selected ? 3 : 2,
        '&:active': { cursor: 'grabbing' },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '-0.5rem',
          borderRadius: '50%',
        },
        ...paints[kind](theme),
        ...focusRing(theme),
      })}
    >
      {ring}
      <Typography
        component="span"
        variant="caption"
        sx={{
          position: 'relative',
          lineHeight: 1,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};
