export type BucketPieceKind = 'strip' | 'dot' | 'curl';
export type BucketPieceTone = 'red' | 'gold' | 'ink';

export interface BucketPiece {
  kind: BucketPieceKind;
  tone: BucketPieceTone;
  x: number;
  y: number;
  rotate: number;
}

export const BUCKET_LEFTOVERS: readonly BucketPiece[] = [
  { kind: 'strip', tone: 'gold', x: 566, y: 150, rotate: 64 },
  { kind: 'dot', tone: 'red', x: 574, y: 157, rotate: 0 },
  { kind: 'curl', tone: 'red', x: 578, y: 146, rotate: -30 },
];

export const BUCKET_SPILL: readonly BucketPiece[] = [
  { kind: 'strip', tone: 'red', x: 548, y: 158, rotate: -44 },
  { kind: 'dot', tone: 'gold', x: 541, y: 163, rotate: 0 },
  { kind: 'curl', tone: 'ink', x: 556, y: 164, rotate: 73 },
  { kind: 'strip', tone: 'gold', x: 534, y: 160, rotate: 32 },
  { kind: 'dot', tone: 'red', x: 526, y: 167, rotate: 0 },
  { kind: 'curl', tone: 'gold', x: 520, y: 161, rotate: -70 },
  { kind: 'strip', tone: 'ink', x: 537, y: 168, rotate: -4 },
  { kind: 'dot', tone: 'ink', x: 512, y: 165, rotate: 0 },
  { kind: 'curl', tone: 'red', x: 544, y: 168, rotate: 30 },
  { kind: 'strip', tone: 'red', x: 505, y: 169, rotate: -78 },
  { kind: 'dot', tone: 'gold', x: 492, y: 158, rotate: 0 },
  { kind: 'curl', tone: 'red', x: 478, y: 166, rotate: -72 },
  { kind: 'strip', tone: 'gold', x: 460, y: 173, rotate: 72 },
  { kind: 'dot', tone: 'red', x: 441, y: 156, rotate: 0 },
  { kind: 'curl', tone: 'ink', x: 414, y: 168, rotate: 78 },
  { kind: 'strip', tone: 'red', x: 386, y: 161, rotate: -22 },
  { kind: 'dot', tone: 'gold', x: 366, y: 174, rotate: 0 },
  { kind: 'curl', tone: 'gold', x: 331, y: 159, rotate: 25 },
  { kind: 'strip', tone: 'ink', x: 292, y: 172, rotate: -51 },
  { kind: 'dot', tone: 'red', x: 262, y: 162, rotate: 0 },
  { kind: 'strip', tone: 'gold', x: 205, y: 174, rotate: -18 },
  { kind: 'dot', tone: 'ink', x: 150, y: 164, rotate: 0 },
  { kind: 'curl', tone: 'red', x: 104, y: 169, rotate: 50 },
];
