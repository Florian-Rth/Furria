import type { KkCastTileState } from '@furria/ui/KkCastGrid';
import type { StudioAttendance, StudioSpot, StudioTraining } from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { CastPerson } from '@/features/running-order/schemas';

export type MarkedAnswer = Extract<AttendanceAnswer, 'yes' | 'no'>;

export interface CastAttendance {
  person: CastPerson;
  response: StudioAttendance | null;
}

export interface AttendanceTally {
  present: number;
  expected: number;
}

export type TrailVoice = 'self' | 'marked';

export interface TrailStep {
  answer: AttendanceAnswer;
  voice: TrailVoice;
  recordedBy: string | null;
}

const isAbsent = (attendance: CastAttendance): boolean => attendance.response?.answer === 'no';

export const castAttendanceOf = (
  cast: readonly CastPerson[],
  training: StudioTraining,
): CastAttendance[] =>
  cast.map((person) => ({
    person,
    response: training.responses.find((response) => response.personId === person.personId) ?? null,
  }));

export const attendanceTallyOf = (attendance: readonly CastAttendance[]): AttendanceTally => ({
  present: attendance.filter((entry) => !isAbsent(entry)).length,
  expected: attendance.length,
});

export const castTileStateOf = (attendance: CastAttendance): KkCastTileState =>
  isAbsent(attendance) ? 'out' : 'in';

export const toggledAnswerOf = (attendance: CastAttendance): MarkedAnswer =>
  isAbsent(attendance) ? 'yes' : 'no';

export const trailOf = (response: StudioAttendance | null): TrailStep[] =>
  response === null || (response.trail.length < 2 && !response.isRecordedOnBehalf)
    ? []
    : response.trail.map((change) => ({
        answer: change.answer,
        voice: change.isRecordedOnBehalf ? 'marked' : 'self',
        recordedBy: change.recordedBy,
      }));

const openSpotIdsOf = (
  spots: readonly StudioSpot[],
  responses: readonly StudioAttendance[],
): number[] =>
  spots.flatMap((spot) =>
    responses.some(
      (response) => response.answer === 'no' && response.personId === spot.person?.personId,
    )
      ? [spot.spotId]
      : [],
  );

const withResponses = (
  training: StudioTraining,
  spots: readonly StudioSpot[],
  responses: StudioAttendance[],
): StudioTraining => ({ ...training, responses, openSpotIds: openSpotIdsOf(spots, responses) });

const othersOf = (training: StudioTraining, personId: number): StudioAttendance[] =>
  training.responses.filter((response) => response.personId !== personId);

export const withMarkedResponse = (
  training: StudioTraining,
  spots: readonly StudioSpot[],
  personId: number,
  answer: MarkedAnswer,
): StudioTraining => {
  const before = training.responses.find((response) => response.personId === personId);
  const step = { answer, isRecordedOnBehalf: true, recordedBy: null };
  const marked: StudioAttendance = {
    personId,
    ...step,
    trail: [{ ...step, recordedAt: new Date().toISOString() }, ...(before?.trail ?? [])],
  };

  return withResponses(training, spots, [...othersOf(training, personId), marked]);
};

export const withWithdrawnMark = (
  training: StudioTraining,
  spots: readonly StudioSpot[],
  personId: number,
): StudioTraining => {
  const before = training.responses.find((response) => response.personId === personId);
  const previous = before?.trail[1];
  const restored: StudioAttendance[] =
    before === undefined || previous === undefined
      ? []
      : [
          {
            personId,
            answer: previous.answer,
            isRecordedOnBehalf: previous.isRecordedOnBehalf,
            recordedBy: previous.recordedBy,
            trail: before.trail.slice(1),
          },
        ];

  return withResponses(training, spots, [...othersOf(training, personId), ...restored]);
};
