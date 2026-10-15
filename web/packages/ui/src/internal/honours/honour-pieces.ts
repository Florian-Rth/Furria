import { arcPath, circlePath, pieceArcs } from './honour-geometry';
import type { KkMetal, LapState } from './honour-laps';

export type PieceFace =
  | { kind: 'metal'; metal: KkMetal }
  | { kind: 'under'; metal: KkMetal }
  | { kind: 'track' };

export interface LapPiece {
  key: string;
  path: string;
  face: PieceFace;
  order: number;
}

const unstruckFace = (under: KkMetal | null): PieceFace =>
  under === null ? { kind: 'track' } : { kind: 'under', metal: under };

export const lapPiecesOf = (
  lap: LapState,
  center: number,
  radius: number,
  gap: number,
): LapPiece[] => {
  if (lap.kind === 'none') {
    return [];
  }
  if (lap.kind === 'closed') {
    return [
      {
        key: `band-${lap.index}`,
        path: circlePath(center, radius),
        face: { kind: 'metal', metal: lap.metal },
        order: 0,
      },
    ];
  }

  return pieceArcs(lap.pieces, radius, gap).map((arc, order) => ({
    key: `piece-${lap.index}-${order}`,
    path: arcPath(center, radius, arc),
    face: order < lap.struck ? { kind: 'metal', metal: lap.metal } : unstruckFace(lap.under),
    order,
  }));
};
