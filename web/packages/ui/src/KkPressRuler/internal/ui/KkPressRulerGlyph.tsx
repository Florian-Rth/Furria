import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkRegisterMarkState } from '../../../KkRegisterMark';
import { rulerPaint } from './ruler-paint';

interface KkPressRulerGlyphProps {
  state: KkRegisterMarkState;
}

export const KkPressRulerGlyph: FC<KkPressRulerGlyphProps> = ({ state }) => {
  const body =
    state === 'loose' ? (
      <rect x={1} y={2} width={4} height={8} data-paint="gold" strokeDasharray="1.5 1" />
    ) : (
      <rect x={1} y={2} width={4} height={8} data-paint={state === 'struck' ? 'faint' : 'ink'} />
    );
  const plate =
    state === 'shifted' ? (
      <rect x={3} y={0.5} width={4} height={8} data-paint="red" strokeWidth={0} />
    ) : null;
  const strike =
    state === 'struck' ? (
      <line x1={0} y1={10.5} x2={6} y2={1.5} data-paint="red-line" strokeWidth={1.3} />
    ) : null;

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 7 11"
      sx={[rulerPaint, { width: 7, height: 11, flexShrink: 0 }]}
    >
      {body}
      {plate}
      {strike}
    </Box>
  );
};
