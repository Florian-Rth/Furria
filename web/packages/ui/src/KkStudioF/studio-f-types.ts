export type KkStudioFDotKind = 'own' | 'cast' | 'open';

export interface KkStudioFDot {
  id: string;
  x: number;
  y: number;
  number: number;
  kind: KkStudioFDotKind;
  rotation: number | null;
}

export type KkStudioFFront = 'top' | 'bottom';

export type KkStudioFTurnDirection = 'forward' | 'back';

export interface KkStudioFTurn {
  key: number;
  direction: KkStudioFTurnDirection;
}

export type KkStudioFSegmentState = 'done' | 'current' | 'ahead';

export interface KkStudioFSegment {
  key: string;
  label: string;
  state: KkStudioFSegmentState;
  opensPart: boolean;
}

export interface KkStudioFChoice {
  id: string;
  label: string;
}
