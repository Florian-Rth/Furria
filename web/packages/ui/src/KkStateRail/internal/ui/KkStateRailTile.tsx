import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import { kkTokens } from '../../../tokens';
import type { KkStateTone } from '../state-rail-paint';
import { jumpPaint, RAIL_TILE_INSET_X, RAIL_TILE_INSET_Y, toneValueInk } from '../state-rail-paint';

interface KkStateRailTileProps {
  label: string;
  value: string;
  detail?: string | null;
  tone?: KkStateTone;
  jumpLabel: string;
  onJump: () => void;
}

export const KkStateRailTile: FC<KkStateRailTileProps> = ({
  label,
  value,
  detail = null,
  tone = 'ink',
  jumpLabel,
  onJump,
}) => {
  const detailLine =
    detail === null ? null : (
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
        {detail}
      </Typography>
    );

  return (
    <Stack
      component="button"
      type="button"
      aria-label={jumpLabel}
      onClick={onJump}
      data-kk-state-tile
      sx={(theme) => ({
        ...jumpPaint(theme),
        ...raisedSurface(theme),
        minWidth: 0,
        minHeight: kkTokens.densePanel.cell,
        justifyContent: 'flex-start',
        px: RAIL_TILE_INSET_X,
        py: RAIL_TILE_INSET_Y,
      })}
    >
      <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        noWrap
        data-kk-state-value
        sx={(theme) => toneValueInk(theme, tone)}
      >
        {value}
      </Typography>
      {detailLine}
    </Stack>
  );
};
