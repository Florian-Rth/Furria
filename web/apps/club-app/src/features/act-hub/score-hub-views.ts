import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkScoreReadinessState } from '@furria/ui/KkScoreReadiness';
import type { MyActTraining } from '@/features/acts/schemas';
import { readinessHintOf, readinessLabelOf, readinessValueOf } from './score-copy';
import type { ScoreDoor } from './score-doors';
import type { ScoreLink } from './score-links';
import type { ReadinessItem, ReadinessKey, ReadinessTarget } from './score-readiness';

const READINESS_ICONS: Record<ReadinessKey, KkIconName> = {
  music: 'music',
  steps: 'list',
  places: 'group',
  movement: 'timeline',
  video: 'play',
};

export type ScoreGo = (link: ScoreLink) => () => void;
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
  training: MyActTraining | null;
  trainingAnswer: TrainingAnswer | null;
  music: string | null;
}

export interface ScoreFactsInput {
  training: MyActTraining | null;
  music: string | null;
}

export interface ScoreDoorView {
  key: ScoreDoor['key'];
  open: () => void;
}

export const trainingAnswerOf = (training: MyActTraining | null): TrainingAnswer | null => {
  const answer = training?.viewerAnswer;

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

export const factsViewOf = ({ training, music }: ScoreFactsInput): ScoreFactsView => ({
  training,
  trainingAnswer: trainingAnswerOf(training),
  music,
});

export const doorViewsOf = (doors: readonly ScoreDoor[], go: ScoreGo): ScoreDoorView[] =>
  doors.map((door) => ({ key: door.key, open: go(door.link) }));
