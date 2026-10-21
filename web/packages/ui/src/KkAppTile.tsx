import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const land = keyframes`
  0% { opacity: 0; transform: scale(1.35) rotate(-9deg); }
  60% { opacity: 1; transform: scale(0.94) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(calc(var(--kk-tile-swing) * -1)) scale(1.06); }
  60% { transform: rotate(var(--kk-tile-swing)) scale(0.98); }
`;

const SQUIRCLE_RATIO = 0.225;
const MARK_RATIO = 0.74;
const RING_GAP = 5;
const SWING_REST_DEG = 4;
const SWING_CHARGED_DEG = 16;
const LAND_DELAY_SECONDS = 0.3;

interface KkAppTileProps {
  label: string;
  size?: number;
  charge?: number;
  tapKey?: number;
  onPress?: () => void;
  sx?: KkSx;
}

export const KkAppTile: FC<KkAppTileProps> = ({
  label,
  size = 72,
  charge = 0,
  tapKey = 0,
  onPress,
  sx,
}) => {
  const radius = size * SQUIRCLE_RATIO;
  const ringExtent = size + RING_GAP * 2;
  const swing = `${SWING_REST_DEG + charge * (SWING_CHARGED_DEG - SWING_REST_DEG)}deg`;
  const ring =
    charge > 0 ? (
      <Box
        component="svg"
        aria-hidden
        viewBox={`0 0 ${ringExtent} ${ringExtent}`}
        sx={{
          position: 'absolute',
          inset: -RING_GAP,
          width: ringExtent,
          height: ringExtent,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <Box
          component="rect"
          x={1}
          y={1}
          width={ringExtent - 2}
          height={ringExtent - 2}
          rx={radius + RING_GAP}
          pathLength={1}
          sx={{
            fill: 'none',
            stroke: (theme) => (theme.vars ?? theme).palette.warning.main,
            strokeWidth: kkTokens.line.page,
            strokeLinecap: 'round',
            strokeDasharray: `${charge} 1`,
            transition: 'stroke-dasharray 160ms ease-out',
          }}
        />
      </Box>
    ) : null;

  return (
    <ButtonBase
      aria-label={label}
      onClick={onPress}
      disableRipple
      data-kk-app-tile
      sx={[
        (theme) => ({
          position: 'relative',
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: `${radius}px`,
          animation: `${land} 0.62s cubic-bezier(0.22, 1, 0.36, 1) ${LAND_DELAY_SECONDS}s both`,
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        key={tapKey}
        sx={(theme) => ({
          '--kk-tile-swing': swing,
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          borderRadius: `${radius}px`,
          color: 'common.white',
          backgroundImage: `linear-gradient(to bottom, ${(theme.vars ?? theme).palette.primary.main}, ${(theme.vars ?? theme).palette.primary.dark})`,
          border: `${kkTokens.line.section}px solid`,
          borderColor: 'text.primary',
          boxShadow: `${kkTokens.shadow.posterOffset} ${(theme.vars ?? theme).palette.text.primary}`,
          animation: tapKey === 0 ? 'none' : `${wiggle} 0.36s ease-out both`,
        })}
      >
        <KkBroomMark size={size * MARK_RATIO} />
      </Box>
      {ring}
    </ButtonBase>
  );
};
