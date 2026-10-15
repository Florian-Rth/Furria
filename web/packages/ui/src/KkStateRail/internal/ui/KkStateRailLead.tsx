import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkStateTone } from '../state-rail-paint';
import {
  jumpPaint,
  RAIL_EDGE,
  RAIL_RISE_SECONDS,
  RAIL_START_SECONDS,
  RAIL_TILE_INSET_X,
  RAIL_TILE_INSET_Y,
  railEdgeDraw,
  railRise,
  toneSource,
  toneValueInk,
} from '../state-rail-paint';

interface KkStateRailLeadProps {
  label: string;
  value: string;
  detail?: string | null;
  tone: KkStateTone;
  dashed?: boolean;
  jumpLabel: string;
  onJump: () => void;
  action?: ReactNode;
}

export const KkStateRailLead: FC<KkStateRailLeadProps> = ({
  label,
  value,
  detail = null,
  tone,
  dashed = false,
  jumpLabel,
  onJump,
  action = null,
}) => {
  const detailLine =
    detail === null ? null : (
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
        {detail}
      </Typography>
    );

  const actionSlot =
    action === null ? null : (
      <Box
        data-kk-state-action
        sx={{
          flexShrink: 0,
          animation: `${railRise} ${RAIL_RISE_SECONDS}s ease-out ${RAIL_START_SECONDS * 3}s both`,
        }}
      >
        {action}
      </Box>
    );

  return (
    <Stack
      direction="row"
      data-kk-state-lead={tone}
      sx={(theme) => {
        const edge = toneSource(theme, tone);
        const edgePaint = dashed
          ? `repeating-linear-gradient(to bottom, ${edge} 0 6px, transparent 6px 10px)`
          : edge;

        return {
          position: 'relative',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 0,
          pr: RAIL_TILE_INSET_X,
          '&::before': {
            content: '""',
            position: 'absolute',
            insetBlock: 0,
            left: 0,
            width: RAIL_EDGE,
            background: edgePaint,
            transformOrigin: 'top',
            animation: `${railEdgeDraw} ${RAIL_RISE_SECONDS * 2}s ease-out ${RAIL_START_SECONDS}s both`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            insetBlock: 0,
            left: RAIL_EDGE,
            width: '40%',
            pointerEvents: 'none',
            backgroundImage: `linear-gradient(to right, color-mix(in srgb, ${edge} 12%, transparent), transparent)`,
            opacity: tone === 'ink' ? 0 : 1,
          },
        };
      }}
    >
      <Stack
        component="button"
        type="button"
        aria-label={jumpLabel}
        onClick={onJump}
        data-kk-state-jump
        sx={(theme) => ({
          ...jumpPaint(theme),
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          minWidth: 0,
          justifyContent: 'center',
          pl: RAIL_TILE_INSET_X + 0.5,
          py: RAIL_TILE_INSET_Y,
        })}
      >
        <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography
          variant="h4"
          component="span"
          noWrap
          data-kk-state-value
          sx={(theme) => ({ lineHeight: 1.15, ...toneValueInk(theme, tone) })}
        >
          {value}
        </Typography>
        {detailLine}
      </Stack>
      {actionSlot}
    </Stack>
  );
};
