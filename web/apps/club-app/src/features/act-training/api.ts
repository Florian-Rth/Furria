import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult } from '@tanstack/react-query';
import { useStudioWriteFailure } from '@/features/act-studio/hooks/use-studio-write-failure';
import { withStudio } from '@/features/act-studio/studio-music';
import type { ActStudioResponse, Studio, StudioTraining } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { requestAttendanceMark, requestAttendanceWithdrawal } from './requests';
import type { MarkedAnswer } from './training-attendance';
import { withMarkedResponse, withWithdrawnMark } from './training-attendance';
import { ROLL_UNDO, rollMarkedMessageOf } from './training-copy';

export interface AttendanceTarget {
  calendarEntryId: number;
  personId: number;
}

export interface AttendanceMark extends AttendanceTarget {
  answer: MarkedAnswer;
  name: string;
}

export interface AttendanceMarks {
  mark: UseMutationResult<void, Error, AttendanceMark>;
  withdraw: UseMutationResult<void, Error, AttendanceTarget>;
}

const CHANGES = ['attendanceResponse'] as const;

const withTraining = (
  current: ActStudioResponse | undefined,
  calendarEntryId: number,
  change: (training: StudioTraining, studio: Studio) => StudioTraining,
): ActStudioResponse | undefined =>
  withStudio(current, (studio) => ({
    ...studio,
    trainings: studio.trainings.map((training) =>
      training.calendarEntryId === calendarEntryId ? change(training, studio) : training,
    ),
  }));

const withMark = (
  current: ActStudioResponse | undefined,
  { calendarEntryId, personId, answer }: AttendanceMark,
): ActStudioResponse | undefined =>
  withTraining(current, calendarEntryId, (training, studio) =>
    withMarkedResponse(training, studio.spots, personId, answer),
  );

const withWithdrawal = (
  current: ActStudioResponse | undefined,
  { calendarEntryId, personId }: AttendanceTarget,
): ActStudioResponse | undefined =>
  withTraining(current, calendarEntryId, (training, studio) =>
    withWithdrawnMark(training, studio.spots, personId),
  );

export const useAttendanceMarks = (actId: number): AttendanceMarks => {
  const studioKey = queryKeys.actStudio(actId);
  const failure = useStudioWriteFailure(actId);
  const key = ['actAttendance', actId];

  const withdraw = useApiMutation({
    request: ({ calendarEntryId, personId }: AttendanceTarget, accessToken) =>
      requestAttendanceWithdrawal(actId, calendarEntryId, personId, accessToken),
    changes: CHANGES,
    optimistic: [optimisticPatch<ActStudioResponse, AttendanceTarget>(studioKey, withWithdrawal)],
    notice: failure,
    key,
  });
  const markedNotice = ({
    calendarEntryId,
    personId,
    answer,
    name,
  }: AttendanceMark): KkNoticeRequest => ({
    tone: 'success',
    message: rollMarkedMessageOf(name, answer),
    actions: [
      {
        id: 'undo',
        label: ROLL_UNDO,
        onSelect: () => {
          withdraw.mutate({ calendarEntryId, personId });
        },
      },
    ],
  });
  const mark = useApiMutation({
    request: ({ calendarEntryId, personId, answer }: AttendanceMark, accessToken) =>
      requestAttendanceMark(actId, calendarEntryId, personId, answer, accessToken),
    changes: CHANGES,
    optimistic: [optimisticPatch<ActStudioResponse, AttendanceMark>(studioKey, withMark)],
    notice: { success: markedNotice, failure: failure.failure },
    key,
  });

  return { mark, withdraw };
};
