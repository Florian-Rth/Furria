export type KkStudioCDotKind = 'own' | 'cast' | 'open';

export interface KkStudioCDot {
  id: string;
  x: number;
  y: number;
  number: number;
  kind: KkStudioCDotKind;
  rotation: number | null;
}

export type KkStudioCBlockState = 'current' | 'looped' | 'idle';

export type KkStudioCSpanTone = 'video' | 'moving' | 'still';

export interface KkStudioCSpan {
  key: string;
  left: number;
  width: number;
  label: string | null;
  tone: KkStudioCSpanTone;
}

export type KkStudioCLaneKind = 'part' | 'step' | 'count' | 'wave' | 'video' | 'formation' | 'own';

export interface KkStudioCLaneLabel {
  kind: KkStudioCLaneKind;
  label: string;
  note: string | null;
}

export interface KkStudioCTick {
  key: string;
  x: number;
  count: number;
}

export interface KkStudioCCut {
  key: string;
  x: number;
  width: number;
  label: string;
}

export type KkStudioCViewPlace = 'topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd';

export interface KkStudioCMark {
  key: string;
  x: number;
}
