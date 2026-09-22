import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { useMeQuery } from '@/features/session';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupAdminMutation, useEndGroupAdminMutation } from '../api';
import {
  toAdminEndConsequence,
  toAdminEndParagraph,
  toAdminFunction,
  toAppointConsequence,
} from '../group-hub-labels';

const APPOINT_LABEL = 'Gruppen-Admin ernennen';
const END_LABEL = 'Gruppen-Admin beenden';

interface GroupAdminEditorInput {
  groupId: number;
  groupName: string;
  admin: GroupDetailAdmin | null;
  runningAdmins: number;
  prefillPerson: PersonRef | null;
}

export interface GroupAdminEditorControl {
  isEditing: boolean;
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  submit: () => void;
}

export const useGroupAdminEditor = ({
  groupId,
  groupName,
  admin,
  runningAdmins,
  prefillPerson,
}: GroupAdminEditorInput): GroupAdminEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = admin !== null;
  const me = useMeQuery();
  const isSelf = admin !== null && admin.personId === me.data?.person.id;

  const [person, setPerson] = useState<PersonRef | null>(prefillPerson);
  const [functionLabel, setFunctionLabel] = useState('');
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddGroupAdminMutation(groupId);
  const endMutation = useEndGroupAdminMutation(groupId);
  const navigate = useNavigate();

  const personName = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const adminName = admin === null ? '' : `${admin.firstName} ${admin.lastName}`;

  const landBack = (adminId: number): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(groupId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('admin', adminId) }),
      replace: true,
    });
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  const submitAppoint = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    setRejection(null);
    addMutation.mutate(
      { personId: person.personId, personName, function: toAdminFunction(functionLabel), sinceOn },
      {
        onSuccess: (added) => {
          landBack(added.groupAdminId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const submitEnd = (): void => {
    if (admin === null || endedOn === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { groupAdminId: admin.groupAdminId, personName: adminName, groupName, isSelf, endedOn },
      {
        onSuccess: () => {
          landBack(admin.groupAdminId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const appointConsequence =
    person === null || sinceOn === null ? null : toAppointConsequence(personName, sinceOn, today);

  const endConsequence = endedOn === null ? null : toAdminEndConsequence(adminName, endedOn, today);

  const consequence = isEditing
    ? toAdminEndParagraph(endConsequence, isSelf, runningAdmins)
    : appointConsequence;

  return {
    isEditing,
    person,
    select,
    clearPerson,
    functionLabel,
    setFunctionLabel,
    sinceOn,
    setSinceOn,
    endedOn,
    setEndedOn,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? endedOn !== today : person !== null,
    actionLabel: isEditing ? END_LABEL : APPOINT_LABEL,
    submit: isEditing ? submitEnd : submitAppoint,
  };
};
