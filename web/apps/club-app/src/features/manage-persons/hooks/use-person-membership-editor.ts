import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { toIsoDay } from '@/lib/day';
import { useCreateMembershipMutation, useUpdateMembershipMutation } from '../api';
import {
  ADD_MEMBERSHIP_ACTION_LABEL,
  MEMBERSHIP_CHANGE_LABEL,
  MEMBERSHIP_END_LABEL,
  toEndMembershipConsequence,
  toMembershipConsequence,
  toOpenPause,
} from '../manage-persons-labels';
import {
  toArchiveLiftedSentence,
  toClosedHistoryLine,
  toMembershipArchiveEffect,
} from '../person-archive';
import type { PersonDetails, PersonMembership } from '../schemas';
import { MembershipFormSchema } from '../schemas';

interface PersonMembershipEditorInput {
  person: PersonDetails;
  membership: PersonMembership | null;
}

export interface PersonMembershipEditorControl {
  startedOn: string | null;
  setStartedOn: (value: string | null) => void;
  startedOnError: string | undefined;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  actionLabel: string;
  actionTone: 'danger' | undefined;
  submit: () => void;
}

export const usePersonMembershipEditor = ({
  person,
  membership,
}: PersonMembershipEditorInput): PersonMembershipEditorControl => {
  const today = toIsoDay(new Date());
  const wasOpen = membership !== null && membership.endedOn === null;

  const create = useCreateMembershipMutation(person.personId);
  const update = useUpdateMembershipMutation(person.personId);

  const write = useWriteForm({
    schema: MembershipFormSchema,
    defaults: {
      startedOn: membership?.startedOn ?? today,
      endedOn: membership?.endedOn ?? null,
    },
    mutate: (submitted) =>
      membership === null
        ? create.mutateAsync(submitted).then((created) => created.membershipId)
        : update
            .mutateAsync({ membershipId: membership.membershipId, ...submitted, wasOpen })
            .then(() => membership.membershipId),
    landing: (membershipId) => ({
      to: '/manage/persons/$personId',
      params: { personId: person.personId },
      mark: { kind: 'membership', id: membershipId },
    }),
  });
  const startedOnField = useController({ control: write.form.control, name: 'startedOn' });
  const endedOnField = useController({ control: write.form.control, name: 'endedOn' });
  const startedOn = startedOnField.field.value;
  const endedOn = endedOnField.field.value;

  const isClosingNow = wasOpen && endedOn !== null;

  const archiveEffect = toMembershipArchiveEffect(person.archive !== null, endedOn, today);

  const periodConsequence =
    startedOn === null
      ? null
      : isClosingNow && endedOn !== null && membership !== null
        ? toEndMembershipConsequence(person.firstName, endedOn, toOpenPause(membership) !== null)
        : toMembershipConsequence(startedOn, endedOn, today);

  const consequence =
    archiveEffect === 'refused'
      ? toClosedHistoryLine(person.firstName, 'beendete Mitgliedschaften')
      : archiveEffect === 'lifted' && periodConsequence !== null
        ? `${periodConsequence} ${toArchiveLiftedSentence(person.firstName)}`
        : periodConsequence;

  return {
    startedOn,
    setStartedOn: startedOnField.field.onChange,
    startedOnError: write.form.formState.errors.startedOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit && archiveEffect !== 'refused',
    actionLabel:
      membership === null
        ? ADD_MEMBERSHIP_ACTION_LABEL
        : isClosingNow
          ? MEMBERSHIP_END_LABEL
          : MEMBERSHIP_CHANGE_LABEL,
    actionTone: isClosingNow ? 'danger' : undefined,
    submit: write.submit,
  };
};
