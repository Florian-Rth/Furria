import { useController } from 'react-hook-form';
import type { Weekday } from '@/features/groups/group-identity';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import { useSetUsualTrainingTimesMutation } from '../api';
import type { UsualTrainingTime } from '../schemas';
import { UsualTrainingTimeFormSchema } from '../schemas';
import {
  toUsualTimeFormValues,
  toUsualTimePayload,
  toUsualTimePayloadOf,
} from '../usual-training-time-labels';

interface UsualTrainingTimeEditorInput {
  groupId: number;
  usualTime: UsualTrainingTime | null;
  usualTimes: readonly UsualTrainingTime[];
}

export interface UsualTrainingTimeEditorControl {
  weekday: Weekday;
  setWeekday: (value: string) => void;
  startsAt: string;
  setStartsAt: (value: string) => void;
  durationMinutes: string;
  setDurationMinutes: (value: string) => void;
  venueId: string;
  setVenueId: (value: string) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  actionLabel: string;
  submit: () => void;
  remove: () => void;
}

const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const toWeekday = (value: string, fallback: Weekday): Weekday => {
  const parsed = UsualTrainingTimeFormSchema.shape.weekday.safeParse(value);

  return parsed.success ? parsed.data : fallback;
};

export const useUsualTrainingTimeEditor = ({
  groupId,
  usualTime,
  usualTimes,
}: UsualTrainingTimeEditorInput): UsualTrainingTimeEditorControl => {
  const mutation = useSetUsualTrainingTimesMutation(groupId);
  const groupLanding: WriteLanding = { to: '/groups/$groupId', params: { groupId } };

  const write = useWriteForm({
    schema: UsualTrainingTimeFormSchema,
    defaults: toUsualTimeFormValues(usualTime),
    mutate: (values) => {
      const payload = toUsualTimePayload(values);

      return mutation.mutateAsync(
        usualTime === null
          ? [...usualTimes.map(toUsualTimePayloadOf), payload]
          : usualTimes.map((existing) =>
              existing.usualTrainingTimeId === usualTime.usualTrainingTimeId
                ? payload
                : toUsualTimePayloadOf(existing),
            ),
      );
    },
    landing: () =>
      usualTime === null
        ? groupLanding
        : {
            ...groupLanding,
            mark: { kind: 'training-usualTime', id: usualTime.usualTrainingTimeId },
          },
  });
  const weekday = useController({ control: write.form.control, name: 'weekday' });
  const startsAt = useController({ control: write.form.control, name: 'startsAt' });
  const durationMinutes = useController({ control: write.form.control, name: 'durationMinutes' });
  const venueId = useController({ control: write.form.control, name: 'venueId' });

  const remove = (): void => {
    if (usualTime === null) {
      return;
    }

    write.run(
      () =>
        mutation.mutateAsync(
          usualTimes
            .filter((existing) => existing.usualTrainingTimeId !== usualTime.usualTrainingTimeId)
            .map(toUsualTimePayloadOf),
        ),
      () => groupLanding,
    );
  };

  return {
    weekday: weekday.field.value,
    setWeekday: (value) => {
      weekday.field.onChange(toWeekday(value, weekday.field.value));
    },
    startsAt: startsAt.field.value,
    setStartsAt: startsAt.field.onChange,
    durationMinutes: String(durationMinutes.field.value),
    setDurationMinutes: (value) => {
      durationMinutes.field.onChange(Number(value));
    },
    venueId: venueId.field.value,
    setVenueId: venueId.field.onChange,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    actionLabel: usualTime === null ? ADD_LABEL : SAVE_LABEL,
    submit: write.submit,
    remove,
  };
};
