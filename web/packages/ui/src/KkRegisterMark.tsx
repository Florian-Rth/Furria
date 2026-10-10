import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeInk } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkRegisterMarkState = 'loose' | 'aligned' | 'shifted' | 'struck';

const VIEW = 24;
const CENTER = VIEW / 2;
const RING = 6.5;
const ARM = 11;
const SHIFT = 4;
const LOOSE_SHIFT = 2.5;
const STROKE = 1.6;

interface KkRegisterMarkProps {
  state: KkRegisterMarkState;
  size?: number;
  sx?: KkSx;
}

interface Plate {
  dx: number;
  dy: number;
  color: (theme: Theme) => CSSObject;
  dashed: boolean;
}

const red = (theme: Theme): string => (theme.vars ?? theme).palette.primary.main;
const ink = (theme: Theme): CSSObject => ({ color: (theme.vars ?? theme).palette.text.primary });
const redPlate = (theme: Theme): CSSObject => ({ color: red(theme) });
const grey = (theme: Theme): CSSObject => ({
  color: (theme.vars ?? theme).palette.text.secondary,
});
const gold = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.gold, kkTokens.color.dark.gold));
const goldInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk));

const PLATES: Record<KkRegisterMarkState, readonly Plate[]> = {
  loose: [
    { dx: -LOOSE_SHIFT, dy: LOOSE_SHIFT, color: gold, dashed: true },
    { dx: LOOSE_SHIFT, dy: -LOOSE_SHIFT, color: goldInk, dashed: true },
  ],
  aligned: [{ dx: 0, dy: 0, color: ink, dashed: false }],
  shifted: [
    { dx: 0, dy: 0, color: ink, dashed: false },
    { dx: SHIFT, dy: -SHIFT / 2, color: redPlate, dashed: false },
  ],
  struck: [{ dx: 0, dy: 0, color: grey, dashed: false }],
};

const crossOf = (dx: number, dy: number): string =>
  `M${CENTER + dx - ARM} ${CENTER + dy}H${CENTER + dx + ARM}M${CENTER + dx} ${CENTER + dy - ARM}V${CENTER + dy + ARM}`;

export const KkRegisterMark: FC<KkRegisterMarkProps> = ({ state, size = 20, sx }) => {
  const plates = PLATES[state].map((plate, order) => (
    <Box
      key={`${state}-${order}`}
      component="g"
      sx={plate.color}
      strokeDasharray={plate.dashed ? '2.2 1.6' : undefined}
    >
      <circle
        cx={CENTER + plate.dx}
        cy={CENTER + plate.dy}
        r={RING}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path d={crossOf(plate.dx, plate.dy)} stroke="currentColor" strokeWidth={STROKE} />
    </Box>
  ));
  const strike =
    state === 'struck' ? (
      <Box
        component="path"
        d={`M3 ${VIEW - 3}L${VIEW - 3} 3`}
        strokeWidth={STROKE * 1.4}
        sx={(theme: Theme) => ({ stroke: red(theme) })}
      />
    ) : null;

  return (
    <Box
      component="svg"
      aria-hidden
      data-kk-register-mark={state}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      sx={[
        { width: size, height: size, flexShrink: 0, display: 'block', overflow: 'visible' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {plates}
      {strike}
    </Box>
  );
};
