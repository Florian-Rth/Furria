import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

export type KkStudioStageDotKind = 'own' | 'cast' | 'open';

const PERCENT = 100;
const GLIDE = 'transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const dotPaints: Record<KkStudioStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}, ${kkTokens.shadow.rest}`,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 55%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
  }),
};

interface KkStudioStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStudioStageDotKind;
  selected: boolean;
  dimmed: boolean;
  gliding: boolean;
  label: string;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
}

export const KkStudioStageDot: FC<KkStudioStageDotProps> = ({
  x,
  y,
  number,
  kind,
  selected,
  dimmed,
  gliding,
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

  return (
    <Box
      role="button"
      aria-label={label}
      aria-pressed={selected}
      data-kk-studio-dot={kind}
      data-selected={selected}
      data-dimmed={dimmed}
      {...drag}
      style={place}
      sx={{
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
        '&[data-dimmed="true"]': { opacity: 0.45 },
      }}
    >
      <Box
        sx={(theme) => ({
          width: { xs: '1.625rem', desktop: '2.125rem' },
          height: { xs: '1.625rem', desktop: '2.125rem' },
          '@container (max-width: 15rem)': { width: '1.125rem', height: '1.125rem' },
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          outline: `${kkTokens.line.section}px solid transparent`,
          outlineOffset: kkTokens.line.section,
          transition: 'outline-color 160ms ease-out, transform 160ms ease-out',
          '[data-selected="true"] > &': {
            outlineColor: palette(theme).text.primary,
            transform: 'scale(1.12)',
          },
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
    </Box>
  );
};
