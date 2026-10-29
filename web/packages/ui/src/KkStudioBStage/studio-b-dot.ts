export type KkStudioBDotRole = 'own' | 'open' | 'cast';

export interface KkStudioBDot {
  spotId: number;
  number: number;
  x: number;
  y: number;
  facing: number | null;
  role: KkStudioBDotRole;
}
