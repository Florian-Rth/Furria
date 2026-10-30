import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import type { KkStudioShare } from './KkStudioDrag/use-studio-drag';
import { useStudioDrag } from './KkStudioDrag/use-studio-drag';
import { kkTokens } from './tokens';

export type KkEightsDotKind = 'own' | 'cast' | 'open';
export type KkEightsTagSide = 'above' | 'below' | 'under';

const PERCENT = 100;
const GLIDE = 'transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const KEY_STEP = 0.025;
const KEY_LEAP = 0.1;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const discPaints: Record<KkEightsDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).text.primary,
    color: palette(theme).background.paper,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: palette(theme).background.paper,
    border: `${kkTokens.line.section}px dashed ${palette(theme).warning.main}`,
  }),
};

const ARROWS: Record<string, KkStudioShare> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

interface KkEightsDotProps {
  x: number;
  y: number;
  number: number;
  name: string | null;
  kind: KkEightsDotKind;
  selected: boolean;
  dimmed: boolean;
  gliding: boolean;
  tagSide: KkEightsTagSide;
  label: string;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
}

export const KkEightsDot: FC<KkEightsDotProps> = ({
  x,
  y,
  number,
  name,
  kind,
  selected,
  dimmed,
  gliding,
  tagSide,
  label,
  onPress,
  onMove,
  onEnd,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
    transition: gliding ? GLIDE : 'none',
  };
  const nudge = (event: KeyboardEvent<HTMLElement>): void => {
    const arrow = ARROWS[event.key];
    if (arrow === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? KEY_LEAP : KEY_STEP;
    onPress({ x, y });
    onMove({ x: x + arrow.x * step, y: y + arrow.y * step });
    onEnd();
  };
  const tag =
    name === null ? null : (
      <Typography
        component="span"
        variant="caption"
        data-side={tagSide}
        sx={(theme) => ({
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translate(-50%, -0.375rem)',
          '&[data-side="above"]': {
            top: 'auto',
            bottom: '100%',
            transform: 'translate(-50%, 0.375rem)',
          },
          '&[data-side="under"]': { transform: 'translate(-50%, 0.75rem)' },
          px: 0.5,
          lineHeight: 1.25,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          borderRadius: `${kkTokens.radius.bar}px`,
          color: palette(theme).text.primary,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 82%, transparent)`,
          '@container (max-width: 16rem)': { display: 'none' },
        })}
      >
        {name}
      </Typography>
    );

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      data-kk-eights-dot={kind}
      data-selected={selected}
      data-dimmed={dimmed}
      {...drag}
      onKeyDown={nudge}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        display: 'grid',
        placeItems: 'center',
        touchAction: 'none',
        cursor: 'grab',
        willChange: 'transform',
        zIndex: selected ? 3 : 1,
        borderRadius: '50%',
        '&[data-dimmed="true"]': { opacity: 0.4 },
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          width: { xs: '1.5rem', desktop: '1.875rem' },
          height: { xs: '1.5rem', desktop: '1.875rem' },
          '@container (max-width: 16rem)': { width: '1.125rem', height: '1.125rem' },
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          outline: `${kkTokens.line.section}px solid transparent`,
          outlineOffset: kkTokens.line.section,
          transition: 'outline-color 160ms ease-out, transform 160ms ease-out',
          '[data-selected="true"] > &': {
            outlineColor: palette(theme).primary.main,
            transform: 'scale(1.1)',
          },
          ...discPaints[kind](theme),
        })}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{
            lineHeight: 1,
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
            color: 'inherit',
          }}
        >
          {number}
        </Typography>
      </Box>
      {tag}
    </Box>
  );
};
