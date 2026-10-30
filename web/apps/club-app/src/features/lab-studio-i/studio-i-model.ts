import type { StepEdge } from './studio-i-spans';

export type StudioIPage = { kind: 'step'; stepId: number } | { kind: 'music' };

export type StudioISelection =
  | { kind: 'dot'; spotId: number }
  | { kind: 'mark'; edge: StepEdge }
  | { kind: 'video' };

export type StudioIMode = { kind: 'practice' } | { kind: 'edit'; stepId: number | null };

export const MUSIC_PAGE: StudioIPage = { kind: 'music' };

export const pageOfStep = (stepId: number | null): StudioIPage =>
  stepId === null ? MUSIC_PAGE : { kind: 'step', stepId };
