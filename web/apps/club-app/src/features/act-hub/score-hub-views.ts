import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkScoreReadinessState } from '@furria/ui/KkScoreReadiness';
import type { StudioEvening, StudioTraining } from '@/features/acts/schemas';
import {
  dayOf,
  eveningFactOf,
  eveningHintOf,
  readinessHintOf,
  readinessLabelOf,
  readinessValueOf,
} from './score-copy';
import type { ScoreDoor } from './score-doors';
import type { ScoreLink } from './score-links';
import type { ReadinessItem, ReadinessKey, ReadinessTarget } from './score-readiness';
import type { ActEvening } from './score-season';
import { eveningNumberOf } from './score-season';

const READINESS_ICONS: Record<ReadinessKey, KkIconName> = {
  music: 'music',
  steps: 'list',
  places: 'group',
  movement: 'timeline',
  video: 'play',
  final: 'flag',
};

export type ScoreGo = (link: ScoreLink) => () => void;
export type ScoreEveningOpener = (eventId: number) => () => void;
export type ScoreReadinessOpener = (target: ReadinessTarget) => () => void;
export type TrainingAnswer = 'yes' | 'no';

export interface ScoreReadinessView {
  key: ReadinessKey;
  icon: KkIconName;
  label: string;
  value: string;
  hint: string;
  state: KkScoreReadinessState;
  open: (() => void) | null;
}

export interface ScoreFactsView {
  training: StudioTraining | null;
  trainingAnswer: TrainingAnswer | null;
  evening: string | null;
  eveningOpen: (() => void) | null;
  music: string | null;
}

export interface ScoreFactsInput {
  training: StudioTraining | null;
  evening: StudioEvening | null;
  viewerId: number | null;
  music: string | null;
}

export interface ScoreEveningView {
  eventId: number;
  number: string | null;
  title: string;
  date: string;
  hint: string;
  open: (() => void) | null;
}

export interface ScoreDoorView {
  key: ScoreDoor['key'];
  open: () => void;
}

export const trainingAnswerOf = (
  training: StudioTraining | null,
  viewerId: number | null,
): TrainingAnswer | null => {
  const answer = training?.responses.find((response) => response.personId === viewerId)?.answer;

  return answer === 'yes' || answer === 'no' ? answer : null;
};

export const readinessViewsOf = (
  items: readonly ReadinessItem[],
  open: ScoreReadinessOpener | null,
): ScoreReadinessView[] =>
  items.map((item) => ({
    key: item.key,
    icon: READINESS_ICONS[item.key],
    label: readinessLabelOf(item.key),
    value: readinessValueOf(item),
    hint: readinessHintOf(item),
    state: item.state,
    open: open === null ? null : open(item.target),
  }));

export const factsViewOf = (
  input: ScoreFactsInput,
  openEvening: ScoreEveningOpener | null,
): ScoreFactsView => {
  const { training, evening } = input;

  return {
    training,
    trainingAnswer: trainingAnswerOf(training, input.viewerId),
    evening:
      evening === null
        ? null
        : eveningFactOf(evening.title, eveningNumberOf(evening), evening.startsAt),
    eveningOpen: evening === null || openEvening === null ? null : openEvening(evening.eventId),
    music: input.music,
  };
};

export const eveningViewsOf = (
  evenings: readonly ActEvening[],
  openEvening: ScoreEveningOpener | null,
): ScoreEveningView[] =>
  evenings.map((entry) => ({
    eventId: entry.eventId,
    number: entry.number === null ? null : String(entry.number),
    title: entry.title,
    date: dayOf(entry.startsAt),
    hint: eveningHintOf(entry.title, entry.number, entry.startsAt),
    open: openEvening === null ? null : openEvening(entry.eventId),
  }));

export const doorViewsOf = (doors: readonly ScoreDoor[], go: ScoreGo): ScoreDoorView[] =>
  doors.map((door) => ({ key: door.key, open: go(door.link) }));
