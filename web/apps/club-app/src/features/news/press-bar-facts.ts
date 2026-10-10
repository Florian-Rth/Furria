import type { KkPressLineTone, KkReadinessSlot, KkRegisterMarkState } from '@furria/ui';
import type { PressKind } from './press-run';
import { STAGE_BEFORE_PRESS } from './press-run';
import type { NewsRequirement, NewsStage } from './types';

export const REGISTER_STATES: Record<NewsStage, KkRegisterMarkState> = {
  draft: 'loose',
  live: 'aligned',
  pending: 'shifted',
  withdrawn: 'struck',
};

export type SaveState = 'saved' | 'saving' | 'failed';

export type PressLine =
  | { kind: 'publishing' }
  | { kind: 'saving' }
  | { kind: 'failed' }
  | { kind: 'viewOnly' }
  | { kind: 'missing'; missing: readonly NewsRequirement[] }
  | { kind: 'saved'; at: string | null }
  | { kind: 'liveSince'; at: string }
  | { kind: 'withdrawnAt'; at: string };

export interface PressLineInput {
  stage: NewsStage;
  save: SaveState;
  savedAt: string | null;
  publishedAt: string | null;
  withdrawnAt: string | null;
  missing: readonly NewsRequirement[];
  isBusy: boolean;
  showsLive: boolean;
  isCompact: boolean;
}

export type SecondaryAction = 'discard' | 'withdraw' | 'delete';

export const SECONDARY_ACTIONS: Record<NewsStage, readonly SecondaryAction[]> = {
  draft: ['delete'],
  live: ['withdraw'],
  pending: ['discard', 'withdraw'],
  withdrawn: ['delete'],
};

const settledLineOf = ({
  stage,
  savedAt,
  publishedAt,
  withdrawnAt,
  missing,
  isCompact,
}: PressLineInput): PressLine => {
  if (isCompact && stage !== 'live' && missing.length > 0) {
    return { kind: 'missing', missing };
  }
  if (stage === 'live' && publishedAt !== null) {
    return { kind: 'liveSince', at: publishedAt };
  }
  if (stage === 'withdrawn' && withdrawnAt !== null) {
    return { kind: 'withdrawnAt', at: withdrawnAt };
  }
  return { kind: 'saved', at: savedAt };
};

export const pressLineOf = (input: PressLineInput): PressLine => {
  if (input.isBusy) {
    return { kind: 'publishing' };
  }
  if (input.save !== 'saved') {
    return { kind: input.save };
  }
  if (input.showsLive) {
    return { kind: 'viewOnly' };
  }
  return settledLineOf(input);
};

const LINE_TONES: Record<PressLine['kind'], KkPressLineTone> = {
  publishing: 'busy',
  saving: 'busy',
  failed: 'alert',
  viewOnly: 'quiet',
  missing: 'warning',
  saved: 'quiet',
  liveSince: 'quiet',
  withdrawnAt: 'quiet',
};

export const lineToneOf = (line: PressLine): KkPressLineTone => LINE_TONES[line.kind];

export const shownStageOf = (stage: NewsStage, kind: PressKind, isBusy: boolean): NewsStage =>
  isBusy ? STAGE_BEFORE_PRESS[kind] : stage;

export const READINESS_ORDER: readonly NewsRequirement[] = ['category', 'title', 'teaser', 'text'];

export const readinessSlotsOf = (
  missing: readonly NewsRequirement[],
  words: Record<NewsRequirement, string>,
): KkReadinessSlot[] =>
  READINESS_ORDER.map((requirement) => ({
    id: requirement,
    label: words[requirement],
    done: !missing.includes(requirement),
  }));

export const showsReadiness = (stage: NewsStage, missingCount: number): boolean =>
  stage !== 'live' && missingCount > 0;
