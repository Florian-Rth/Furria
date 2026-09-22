import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddRoleHoldingMutation, useEndRoleHoldingMutation } from '../api';
import {
  toEndHoldingConsequence,
  toHoldingConsequence,
  toPersonName,
} from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const END_LABEL = 'Inhaberschaft beenden';
const ADD_LABEL = 'Inhaberschaft eintragen';

interface RoleHoldingEditorInput {
  roleId: number;
  roleName: string;
  holder: RoleHolder | null;
  prefillPerson: PersonRef | null;
}

export interface RoleHoldingEditorControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
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

export const useRoleHoldingEditor = ({
  roleId,
  roleName,
  holder,
  prefillPerson,
}: RoleHoldingEditorInput): RoleHoldingEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = holder !== null;

  const [person, setPerson] = useState<PersonRef | null>(prefillPerson);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddRoleHoldingMutation(roleId, roleName);
  const endMutation = useEndRoleHoldingMutation(roleId);
  const navigate = useNavigate();

  const personName = person === null ? '' : toPersonName(person);
  const holderName = holder === null ? '' : toPersonName(holder);

  const landBack = (roleHoldingId: number): void => {
    void navigate({
      to: '/manage/roles',
      search: (previous) => ({
        ...previous,
        role: roleId,
        changed: toLandingKey('role-holding', roleHoldingId),
      }),
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

  const submitAdd = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    setRejection(null);
    addMutation.mutate(
      { personId: person.personId, personName, sinceOn },
      {
        onSuccess: (added) => {
          landBack(added.roleHoldingId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const submitEnd = (): void => {
    if (holder === null || endedOn === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { roleHoldingId: holder.roleHoldingId, personName: holderName, endedOn },
      {
        onSuccess: () => {
          landBack(holder.roleHoldingId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndHoldingConsequence(holderName, roleName, endedOn, today)
    : person === null || sinceOn === null
      ? null
      : toHoldingConsequence(personName, roleName, sinceOn, today);

  return {
    person,
    select,
    clearPerson,
    sinceOn,
    setSinceOn,
    endedOn,
    setEndedOn,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? endedOn !== today : person !== null,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: isEditing ? submitEnd : submitAdd,
  };
};
