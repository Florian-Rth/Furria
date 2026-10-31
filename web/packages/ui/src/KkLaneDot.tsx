import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import type { KkStudioShare } from './KkStudioDrag/use-studio-drag';
import { useStudioDrag } from './KkStudioDrag/use-studio-drag';
import type { KkStudioStageDotKind } from './KkStudioStage/KkStudioStage';
import { kkTokens } from './tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const dotPaints: Record<KkStudioStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: palette(theme).background.paper,
    border: `${kkTokens.line.section}px dashed ${palette(theme).warning.main}`,
  }),
};

const ARROWS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface KkLaneDotProps {
  x: number;
  y: number;
  number: number;
  name: string;
  kind: KkStudioStageDotKind;
  selected: boolean;
  dimmed: boolean;
  label: string;
  interactive?: boolean;
  nameAbove?: boolean;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
  onNudge: (right: number, down: number) => void;
}

export const KkLaneDot: FC<KkLaneDotProps> = ({
  x,
  y,
  number,
  name,
  kind,
  selected,
  dimmed,
  label,
  interactive = true,
  nameAbove = false,
  onPress,
  onMove,
  onEnd,
  onNudge,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    const arrow = ARROWS[event.key];
    if (arrow === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onNudge(arrow[0], arrow[1]);
  };
  const handlers = interactive
    ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': label,
        'aria-pressed': selected,
        onKeyDown: press,
        ...drag,
      }
    : { 'aria-hidden': true };
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };

  return (
    <Box
      data-kk-lane-dot={kind}
      data-selected={selected}
      data-dimmed={dimmed}
      {...handlers}
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
        cursor: interactive ? 'grab' : 'default',
        willChange: 'transform',
        zIndex: selected ? 3 : 1,
        borderRadius: '50%',
        '&[data-dimmed="true"]': { opacity: 0.4 },
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          width: '1.75rem',
          height: '1.75rem',
          '@container (max-width: 22rem)': { width: '1.375rem', height: '1.375rem' },
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
      </Box>
      <Typography
        component="span"
        aria-hidden
        variant="caption"
        sx={(theme) => ({
          position: 'absolute',
          top: nameAbove ? 'auto' : 'calc(50% + 0.95rem)',
          bottom: nameAbove ? 'calc(50% + 0.95rem)' : 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          px: 0.375,
          maxWidth: '6rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.15,
          fontWeight: 800,
          borderRadius: `${kkTokens.radius.bar}px`,
          color: kind === 'open' ? undefined : palette(theme).text.primary,
          ...(kind === 'open' ? goldInkOf(theme) : {}),
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 82%, transparent)`,
          pointerEvents: 'none',
          '[data-selected="true"] > &': {
            color: palette(theme).primary.contrastText,
            backgroundColor: palette(theme).primary.main,
          },
        })}
      >
        {name}
      </Typography>
    </Box>
  );
};
