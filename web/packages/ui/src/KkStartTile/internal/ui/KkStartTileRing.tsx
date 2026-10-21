import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkProgressRing } from '../../../KkProgressRing/KkProgressRing';
import type { KkProgressRingPart } from '../../../KkProgressRing/progress-ring';
import { kkTokens } from '../../../tokens';
import { useTileLanding } from '../logic/tile-context';
import { tileLandDelayMs } from '../logic/tile-land';
import { goldGround, goldInk, TILE_INNER_RADIUS } from '../tile-paint';

const CAPTION_PAINT = (theme: Theme): CSSObject => ({
  ...goldInk(theme),
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
});

const FILL_AFTER_LAND_MS = 220;

const ringButtonPaint =
  (delayMs: number) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    alignSelf: 'flex-start',
    flexDirection: 'column',
    gap: 0.25,
    borderRadius: TILE_INNER_RADIUS,
    '& [data-kk-progress-ring]': { borderRadius: '50%', ...goldGround(theme) },
    '& [data-ring-reveal]': { animationDelay: `${delayMs}ms` },
    '& [data-kk-progress-ring] span': { color: 'text.primary' },
    transition: 'transform 120ms ease-out',
    '&:active': { transform: 'scale(0.94)' },
  });

interface KkStartTileRingProps {
  owed: number;
  answered: number;
  caption: string;
  label: string;
  onClick: () => void;
}

export const KkStartTileRing: FC<KkStartTileRingProps> = ({
  owed,
  answered,
  caption,
  label,
  onClick,
}) => {
  const { order } = useTileLanding();
  const parts: KkProgressRingPart[] = [
    { state: 'overdue', count: owed },
    { state: 'done', count: answered },
  ];

  return (
    <ButtonBase
      data-kk-start-tile-control
      data-kk-start-tile-ring
      aria-label={label}
      onClick={onClick}
      sx={ringButtonPaint(tileLandDelayMs(order) + FILL_AFTER_LAND_MS)}
    >
      <KkProgressRing parts={parts} label={label} value={String(owed)} size="large" />
      <Typography component="span" variant="caption" aria-hidden sx={CAPTION_PAINT}>
        {caption}
      </Typography>
    </ButtonBase>
  );
};
