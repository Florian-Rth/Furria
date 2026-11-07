import type { StageExtent } from './stage-framing';

export type StageGridAxis = 'x' | 'y';

export type StageGridKind = 'metre' | 'quarter' | 'snap';

export interface StageGridLine {
  key: string;
  axis: StageGridAxis;
  at: number;
  kind: StageGridKind;
}

export const STAGE_GRID_METRES = 0.25;

const QUARTERS_PER_METRE = Math.round(1 / STAGE_GRID_METRES);
const EDGE = 1e-9;

const axisLinesOf = (
  axis: StageGridAxis,
  metres: number,
  origin: number,
  quarters: boolean,
): StageGridLine[] => {
  const first = -Math.floor((origin - EDGE) * QUARTERS_PER_METRE);
  const last = Math.floor((metres - origin - EDGE) * QUARTERS_PER_METRE);
  const lines: StageGridLine[] = [];
  for (let step = first; step <= last; step += 1) {
    const whole = step % QUARTERS_PER_METRE === 0;
    if ((whole || quarters) && origin + step * STAGE_GRID_METRES > EDGE) {
      lines.push({
        key: `${axis}${step}`,
        axis,
        at: (origin + step * STAGE_GRID_METRES) / metres,
        kind: whole ? 'metre' : 'quarter',
      });
    }
  }

  return lines;
};

export const stageGridOf = (stage: StageExtent, quarters: boolean): StageGridLine[] => [
  ...axisLinesOf('x', stage.widthMetres, stage.widthMetres / 2, quarters),
  ...axisLinesOf('y', stage.depthMetres, 0, quarters),
];

export const snapLinesOf = (snap: { x: number; y: number } | null): StageGridLine[] =>
  snap === null
    ? []
    : [
        { key: 'snap-x', axis: 'x', at: snap.x, kind: 'snap' },
        { key: 'snap-y', axis: 'y', at: snap.y, kind: 'snap' },
      ];
