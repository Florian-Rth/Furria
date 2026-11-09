import Box from '@mui/material/Box';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkHsv } from '../../../internal/tone-color';
import { hexOfHsv } from '../../../internal/tone-color';
import { kkTokens } from '../../../tokens';
import { useToneAreaDrag } from '../logic/use-tone-area-drag';

const AREA_HEIGHT = 18;
const THUMB_SIZE = 3;
const PERCENT = 100;
const THUMB_EDGE = '#FFFFFF';
const THUMB_SHADOW = '0 0 0 1px rgba(0,0,0,0.45)';

const areaBackground = (hue: number): string =>
  `linear-gradient(to top, #000000, rgba(0,0,0,0)), linear-gradient(to right, #FFFFFF, hsl(${hue} 100% 50%))`;

interface KkToneAreaProps {
  hsv: KkHsv;
  label: string;
  onPick: (hsv: KkHsv) => void;
}

export const KkToneArea: FC<KkToneAreaProps> = ({ hsv, label, onPick }) => {
  const handlers = useToneAreaDrag(hsv, onPick);
  const valueText = hexOfHsv(hsv);
  const thumbLeft = `${hsv.s * PERCENT}%`;
  const thumbTop = `${(1 - hsv.v) * PERCENT}%`;

  return (
    <Box
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={valueText}
      aria-valuenow={Math.round(hsv.s * PERCENT)}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      {...handlers}
      sx={(theme) => ({
        position: 'relative',
        height: theme.spacing(AREA_HEIGHT),
        borderRadius: `${kkTokens.radius.base}px`,
        background: areaBackground(hsv.h),
        cursor: 'crosshair',
        touchAction: 'none',
        userSelect: 'none',
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: thumbLeft,
          top: thumbTop,
          width: theme.spacing(THUMB_SIZE),
          height: theme.spacing(THUMB_SIZE),
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          borderWidth: kkTokens.line.section,
          borderStyle: 'solid',
          borderColor: THUMB_EDGE,
          boxShadow: THUMB_SHADOW,
          backgroundColor: valueText,
          pointerEvents: 'none',
        })}
      />
    </Box>
  );
};
