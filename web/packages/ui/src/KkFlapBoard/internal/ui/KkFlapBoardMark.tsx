import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { BOARD_INK } from '../../../internal/status-paint';

const VIEW = 24;
const CENTER = VIEW / 2;
const RING = 6.5;
const ARM = 10;
const SHIFT = 3.5;
const STROKE = 1.6;

interface Plate {
  dx: number;
  dy: number;
  ink: string;
  dashed: boolean;
}

const PLATES: Record<KkStatusLevel, readonly Plate[]> = {
  ok: [{ dx: 0, dy: 0, ink: BOARD_INK.ok, dashed: false }],
  attention: [
    { dx: 0, dy: 0, ink: BOARD_INK.sub, dashed: false },
    { dx: SHIFT, dy: -SHIFT / 2, ink: BOARD_INK.attention, dashed: false },
  ],
  broken: [{ dx: 0, dy: 0, ink: BOARD_INK.faint, dashed: false }],
  unknown: [{ dx: 0, dy: 0, ink: BOARD_INK.faint, dashed: true }],
};

const STRIKE = `M3 ${VIEW - 3}L${VIEW - 3} 3`;

const crossOf = (dx: number, dy: number): string =>
  `M${CENTER + dx - ARM} ${CENTER + dy}H${CENTER + dx + ARM}M${CENTER + dx} ${CENTER + dy - ARM}V${CENTER + dy + ARM}`;

interface KkFlapBoardMarkProps {
  level: KkStatusLevel;
}

export const KkFlapBoardMark: FC<KkFlapBoardMarkProps> = ({ level }) => {
  const plates = PLATES[level].map((plate, order) => {
    const dash = plate.dashed ? '2.2 1.6' : undefined;

    return (
      <g key={`${level}-${order}`} stroke={plate.ink} strokeDasharray={dash} fill="none">
        <circle cx={CENTER + plate.dx} cy={CENTER + plate.dy} r={RING} strokeWidth={STROKE} />
        <path d={crossOf(plate.dx, plate.dy)} strokeWidth={STROKE} />
      </g>
    );
  });
  const strike =
    level === 'broken' ? (
      <path d={STRIKE} stroke={BOARD_INK.broken} strokeWidth={STROKE * 1.5} />
    ) : null;

  return (
    <Box
      component="svg"
      aria-hidden
      data-kk-flap-board-mark={level}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      sx={{ width: 18, height: 18, flexShrink: 0, display: 'block', overflow: 'visible' }}
    >
      {plates}
      {strike}
    </Box>
  );
};
