import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import type { KkStepState } from '@furria/ui/step-state';
import { spotPathsOf } from '@/features/act-player/choreography-motion';
import { timedStepsOf } from '@/features/act-player/hooks/use-studio-playback';
import { musicSegmentsOf } from '@/features/act-player/music-timeline';
import { canPractise } from '@/features/acts/act-studio';
import { toShortName } from '@/features/acts/acts-copy';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { toInitials } from '@/lib/initials';
import type { AttendanceMarks } from '../api';
import type { CastAttendance } from '../training-attendance';
import {
  attendanceTallyOf,
  castAttendanceOf,
  castTileStateOf,
  toggledAnswerOf,
  trailOf,
} from '../training-attendance';
import {
  ROLL_MARK_NOTE,
  ROLL_MAYBE_BADGE,
  ROLL_READ_NOTE,
  rollTileLabelOf,
  rollTrailLineOf,
  trainingGapsTextOf,
  trainingTallyOf,
  trainingWhenOf,
} from '../training-copy';
import { trainingGapsOf } from '../training-gaps';

export interface TrainingRollTrailLine {
  personId: number;
  text: string;
}

export interface TrainingRollPaneState {
  title: string;
  when: string;
  state: KkStepState;
  stateLabel: string;
  openLine: string | null;
  note: string;
  tiles: KkCastTile[];
  readOnly: boolean;
  toggle: (personId: number) => void;
  trail: TrainingRollTrailLine[];
  canStart: boolean;
  start: () => void;
}

interface TrainingRollSource {
  studio: Studio;
  training: StudioTraining;
  cast: readonly CastPerson[];
  canMark: boolean;
  onStart: (calendarEntryId: number) => void;
}

const nameOf = (person: CastPerson): string => toShortName(person.firstName, person.lastName);

const tileOf = (attendance: CastAttendance): KkCastTile => ({
  id: attendance.person.personId,
  name: nameOf(attendance.person),
  initials: toInitials(attendance.person.firstName, attendance.person.lastName),
  portrait: toImageSource(attendance.person.portrait, 'portrait'),
  state: castTileStateOf(attendance),
  badge: attendance.response?.answer === 'maybe' ? ROLL_MAYBE_BADGE : null,
  stateLabel: rollTileLabelOf(attendance.response),
});

const trailLinesOf = (attendance: readonly CastAttendance[]): TrainingRollTrailLine[] =>
  attendance.flatMap((entry) => {
    const steps = trailOf(entry.response);

    return steps.length === 0
      ? []
      : [{ personId: entry.person.personId, text: rollTrailLineOf(nameOf(entry.person), steps) }];
  });

export const useTrainingRollPane = (
  { studio, training, cast, canMark, onStart }: TrainingRollSource,
  marks: AttendanceMarks,
): TrainingRollPaneState => {
  const attendance = castAttendanceOf(cast, training);
  const tally = attendanceTallyOf(attendance);
  const gaps = trainingGapsOf(
    training,
    studio.spots,
    spotPathsOf(studio.choreography, musicSegmentsOf(studio)),
    timedStepsOf(studio.steps),
  );

  const toggle = (personId: number): void => {
    const entry = attendance.find((candidate) => candidate.person.personId === personId);
    if (entry === undefined || !canMark) {
      return;
    }

    marks.mark.mutate({
      calendarEntryId: training.calendarEntryId,
      personId,
      answer: toggledAnswerOf(entry),
      name: nameOf(entry.person),
    });
  };

  return {
    title: training.title,
    when: trainingWhenOf(training),
    state: tally.expected > 0 && tally.present === tally.expected ? 'done' : 'open',
    stateLabel: trainingTallyOf(tally),
    openLine: trainingGapsTextOf(gaps),
    note: canMark ? ROLL_MARK_NOTE : ROLL_READ_NOTE,
    tiles: attendance.map(tileOf),
    readOnly: !canMark,
    toggle,
    trail: trailLinesOf(attendance),
    canStart: canPractise(studio),
    start: () => {
      onStart(training.calendarEntryId);
    },
  };
};
