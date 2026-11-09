import Slider from '@mui/material/Slider';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const HUE_MAX = 359;
const RAIL_HEIGHT = 1.5;
const HUE_SPECTRUM =
  'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)';
const THUMB_EDGE = '#FFFFFF';
const THUMB_SHADOW = '0 0 0 1px rgba(0,0,0,0.45)';

interface KkToneHueProps {
  hue: number;
  label: string;
  onPick: (hue: number) => void;
}

const firstValue = (value: number | number[]): number =>
  typeof value === 'number' ? value : (value[0] ?? 0);

export const KkToneHue: FC<KkToneHueProps> = ({ hue, label, onPick }) => {
  const handleChange = (_event: Event, value: number | number[]): void => {
    onPick(firstValue(value));
  };
  const thumbColor = `hsl(${hue} 100% 50%)`;

  return (
    <Slider
      aria-label={label}
      min={0}
      max={HUE_MAX}
      value={Math.round(hue)}
      onChange={handleChange}
      track={false}
      sx={(theme) => ({
        '& .MuiSlider-rail': {
          height: theme.spacing(RAIL_HEIGHT),
          opacity: 1,
          background: HUE_SPECTRUM,
        },
        '& .MuiSlider-thumb': {
          backgroundColor: thumbColor,
          border: `${kkTokens.line.section}px solid ${THUMB_EDGE}`,
          boxShadow: THUMB_SHADOW,
        },
      })}
    />
  );
};
