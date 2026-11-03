import type { KkGroupTone } from '@furria/ui/group-tone';
import type { ReactNode } from 'react';
import type { CountMark, MusicSegment, TimelineRange } from '../models/music-timeline';
import type { AudioPeaks } from '../models/studio-schemas';
import type { TimelineBlock } from './internal/ui/TimelineBlocks';
import type { TimelineDiamond } from './internal/ui/TimelineDiamonds';
import type { TimelineHandle } from './internal/ui/TimelineHandles';
import type { TimelineMark } from './internal/ui/TimelineMarks';
import type { TimelinePart } from './internal/ui/TimelineParts';
import type { TimelineRegion } from './internal/ui/TimelineRegions';
import type { TimelineStep } from './internal/ui/TimelineSteps';

export const TIMELINE_LANE = {
  parts: 'parts',
  steps: 'steps',
  videos: 'videos',
  keys: 'keys',
} as const;

export interface TimelinePartsLayer {
  parts: readonly TimelinePart[];
  tone: KkGroupTone | null;
  onSelect?: (partId: number) => void;
}

export interface TimelineWaveLayer {
  segments: readonly MusicSegment[];
  peaks: ReadonlyMap<number, AudioPeaks>;
  revealSeconds?: number | null;
  counts?: readonly CountMark[];
  cuts?: boolean;
  beats?: readonly TimelineMark[];
  regions?: readonly TimelineRegion[];
  trim?: TimelineRange | null;
  handles?: readonly TimelineHandle[];
  note?: ReactNode;
}

export interface TimelineStepsLayer {
  steps: readonly TimelineStep[];
  activeKey: number | null;
  selectedKey?: number | null;
  revealSeconds?: number | null;
  borders?: readonly TimelineHandle[];
  note?: ReactNode;
  onSelect?: (stepId: number) => void;
}

export interface TimelineVideosLayer {
  blocks: readonly TimelineBlock[];
  note?: ReactNode;
}

export interface TimelineKeysLayer {
  diamonds: readonly TimelineDiamond[];
  note?: ReactNode;
}
