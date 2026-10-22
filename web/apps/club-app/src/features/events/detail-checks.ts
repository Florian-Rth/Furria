import type { KkStepState } from '@furria/ui/step-state';
import { stepStatusOf } from './event-plan';
import type { EventDetails } from './schemas';

export const DETAIL_CHECKS = [
  'when',
  'doors',
  'venue',
  'teaser',
  'description',
  'picture',
  'ageHint',
] as const;
export type DetailCheck = (typeof DETAIL_CHECKS)[number];

export const PUBLISH_CHECKS = ['venue', 'doors', 'description', 'picture'] as const;

export type CheckFix = 'edit' | 'picture' | null;

export interface PaneCheck {
  key: DetailCheck;
  state: KkStepState;
  fix: CheckFix;
}

type CheckedEvent = Pick<
  EventDetails,
  | 'venueName'
  | 'doorsOpenAt'
  | 'teaser'
  | 'description'
  | 'picture'
  | 'ageHint'
  | 'steps'
  | 'status'
>;

const OPTIONAL_CHECKS: ReadonlySet<DetailCheck> = new Set(['ageHint']);

const isPresent = (event: CheckedEvent, key: DetailCheck): boolean => {
  switch (key) {
    case 'when':
      return true;
    case 'doors':
      return event.doorsOpenAt !== null;
    case 'venue':
      return event.venueName !== null;
    case 'teaser':
      return event.teaser.trim() !== '';
    case 'description':
      return event.description !== null && event.description.trim() !== '';
    case 'picture':
      return event.picture !== null;
    case 'ageHint':
      return event.ageHint !== null;
  }
};

const missingStateOf = (event: CheckedEvent, key: DetailCheck): KkStepState => {
  if (OPTIONAL_CHECKS.has(key) || event.status === 'cancelled') {
    return 'off';
  }

  return stepStatusOf(event, 'details')?.state === 'overdue' ? 'overdue' : 'open';
};

export const checkOf = (event: CheckedEvent, key: DetailCheck): PaneCheck => {
  if (isPresent(event, key)) {
    return { key, state: 'done', fix: null };
  }

  return {
    key,
    state: missingStateOf(event, key),
    fix: key === 'picture' ? 'picture' : 'edit',
  };
};

export const checksOf = (event: CheckedEvent, keys: readonly DetailCheck[]): PaneCheck[] =>
  keys.map((key) => checkOf(event, key));
