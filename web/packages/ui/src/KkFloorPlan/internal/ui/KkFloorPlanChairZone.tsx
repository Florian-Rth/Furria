import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkPlanSides, KkPlanTableShape } from '../floor-plan-paint';
import { hitAttributes, mutedPaint, placeAt, planPalette, planTint } from '../floor-plan-paint';

interface KkFloorPlanChairZoneProps {
  id?: string;
  shape: KkPlanTableShape;
  x: number;
  y: number;
  lengthCm: number;
  widthCm: number;
  rotation: number;
  depthCm: number;
  sides: KkPlanSides;
  conflict?: boolean;
  muted?: boolean;
}

interface Band {
  side: keyof KkPlanSides;
  x: number;
  y: number;
  width: number;
  height: number;
}

const bandsOf = (lengthCm: number, widthCm: number, depthCm: number): readonly Band[] => {
  const halfLength = lengthCm / 2;
  const halfWidth = widthCm / 2;

  return [
    { side: 'front', x: -halfLength, y: -halfWidth - depthCm, width: lengthCm, height: depthCm },
    { side: 'back', x: -halfLength, y: halfWidth, width: lengthCm, height: depthCm },
    { side: 'start', x: -halfLength - depthCm, y: -halfWidth, width: depthCm, height: widthCm },
    { side: 'end', x: halfLength, y: -halfWidth, width: depthCm, height: widthCm },
  ];
};

const annulusOf = (inner: number, outer: number): string =>
  `M${outer} 0A${outer} ${outer} 0 1 0 ${-outer} 0A${outer} ${outer} 0 1 0 ${outer} 0Z` +
  `M${inner} 0A${inner} ${inner} 0 1 1 ${-inner} 0A${inner} ${inner} 0 1 1 ${inner} 0Z`;

export const KkFloorPlanChairZone: FC<KkFloorPlanChairZoneProps> = ({
  id,
  shape,
  x,
  y,
  lengthCm,
  widthCm,
  rotation,
  depthCm,
  sides,
  conflict = false,
  muted = false,
}) => {
  const tint = (theme: Theme) => ({
    fill: conflict
      ? planTint(planPalette(theme).primary.main, '26%')
      : planTint(planPalette(theme).info.main, '16%'),
  });
  const zone =
    shape === 'round' ? (
      <Box
        component="path"
        d={annulusOf(lengthCm / 2, lengthCm / 2 + depthCm)}
        fillRule="evenodd"
        sx={tint}
      />
    ) : (
      bandsOf(lengthCm, widthCm, depthCm)
        .filter((band) => sides[band.side])
        .map((band) => (
          <Box
            key={band.side}
            component="rect"
            x={band.x}
            y={band.y}
            width={band.width}
            height={band.height}
            sx={tint}
          />
        ))
    );

  return (
    <Box
      component="g"
      transform={placeAt(x, y, rotation)}
      {...hitAttributes(id, muted)}
      data-kk-plan-chair-zone
      sx={mutedPaint(muted)}
    >
      {zone}
    </Box>
  );
};
