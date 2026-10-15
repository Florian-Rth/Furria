import Box from '@mui/material/Box';
import type { FC } from 'react';
import { pointOn } from '../../../internal/honours/honour-geometry';
import { STANDING_DOT_DEGREES } from '../../../internal/honours/honour-metrics';
import { appDotPaint, haloPaint } from '../../../internal/honours/honour-paint';
import type { KkStandingApp } from '../../../internal/honours/honour-types';

const HALO_SHARE = 1.3;
const HOLLOW_SHARE = 0.78;
const HOLLOW_STROKE = 0.5;

interface KkAvatarStandingDotProps {
  box: number;
  faceRadius: number;
  dotRadius: number;
  app: Exclude<KkStandingApp, 'none'>;
}

export const KkAvatarStandingDot: FC<KkAvatarStandingDotProps> = ({
  box,
  faceRadius,
  dotRadius,
  app,
}) => {
  const spot = pointOn(box / 2, faceRadius, STANDING_DOT_DEGREES);
  const hollow = app === 'invited';
  const radius = hollow ? dotRadius * HOLLOW_SHARE : dotRadius;
  const ringWidth = hollow ? dotRadius * HOLLOW_STROKE : 0;
  const halo = dotRadius * HALO_SHARE;
  const paint = appDotPaint(app);

  return (
    <g data-kk-avatar-app={app}>
      <Box component="circle" cx={spot.x} cy={spot.y} r={halo} sx={haloPaint} />
      <Box
        component="circle"
        cx={spot.x}
        cy={spot.y}
        r={radius}
        strokeWidth={ringWidth}
        sx={paint}
      />
    </g>
  );
};
