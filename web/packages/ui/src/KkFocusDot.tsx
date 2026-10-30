import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import type { KkStudioShare } from './KkStudioDrag/use-studio-drag';
import { useStudioDrag } from './KkStudioDrag/use-studio-drag';
import { kkTokens } from './tokens';

export type KkFocusDotKind = 'own' | 'cast' | 'open';
export type KkFocusDotNameSide = 'below' | 'above' | 'none';

const PERCENT = 100;
const GLIDE = 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const KEY_STEP = 0.02;
const KEY_STEP_FINE = 0.005;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const dotPaints: Record<KkFocusDotKind, (theme: Theme) => CSSObject> = {
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

const KEY_MOVES: Readonly<Record<string, KkStudioShare>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

interface KkFocusDotProps {
  x: number;
  y: number;
  number: number;
  name: string;
  nameSide: KkFocusDotNameSide;
  kind: KkFocusDotKind;
  selected: boolean;
  dimmed: boolean;
  gliding: boolean;
  turn: number | null;
  label: string;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
  onNudge: (delta: KkStudioShare) => void;
}

export const KkFocusDot: FC<KkFocusDotProps> = ({
  x,
  y,
  number,
  name,
  nameSide,
  kind,
  selected,
  dimmed,
  gliding,
  turn,
  label,
  onPress,
  onMove,
  onEnd,
  onNudge,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
    transition: gliding ? GLIDE : 'none',
  };
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    const move = KEY_MOVES[event.key];
    if (move === undefined) {
      return;
    }
    event.preventDefault();
    const step = event.shiftKey ? KEY_STEP_FINE : KEY_STEP;
    onNudge({ x: move.x * step, y: move.y * step });
  };
  const notch =
    turn === null ? null : (
      <Box
        aria-hidden
        style={{ transform: `rotate(${turn}deg)` }}
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: 0,
            height: 0,
            transform: 'translate(-50%, -0.125rem)',
            borderLeft: '0.25rem solid transparent',
            borderRight: '0.25rem solid transparent',
            borderTop: `0.375rem solid ${palette(theme).text.primary}`,
          })}
        />
      </Box>
    );

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      aria-roledescription="verschiebbar"
      data-kk-focus-dot={kind}
      data-selected={selected}
      data-dimmed={dimmed}
      {...drag}
      onKeyDown={press}
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
          position: 'relative',
          width: { xs: '1.5rem', md: '1.875rem' },
          height: { xs: '1.5rem', md: '1.875rem' },
          '@container (max-width: 15rem)': { width: '1.125rem', height: '1.125rem' },
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          outline: `${kkTokens.line.section}px solid transparent`,
          outlineOffset: kkTokens.line.section,
          transition: 'outline-color 160ms ease-out',
          '[data-selected="true"] > &': { outlineColor: palette(theme).primary.main },
          ...dotPaints[kind](theme),
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
        {notch}
      </Box>
      <Typography
        aria-hidden
        component="span"
        variant="caption"
        data-kind={kind}
        data-side={nameSide}
        sx={(theme) => ({
          position: 'absolute',
          top: 'calc(100% - 0.5rem)',
          '&[data-side="above"]': { top: 'auto', bottom: 'calc(100% - 0.5rem)' },
          '&[data-side="none"]': { display: 'none' },
          left: '50%',
          transform: 'translateX(-50%)',
          px: 0.5,
          borderRadius: `${kkTokens.radius.bar}px`,
          lineHeight: 1.25,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          color: palette(theme).text.primary,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 82%, transparent)`,
          '&[data-kind="open"]': goldInkOf(theme),
          '[data-selected="true"] > &': {
            color: palette(theme).primary.contrastText,
            backgroundColor: palette(theme).primary.main,
          },
          '@container (max-width: 15rem)': { display: 'none' },
        })}
      >
        {name}
      </Typography>
    </Box>
  );
};
