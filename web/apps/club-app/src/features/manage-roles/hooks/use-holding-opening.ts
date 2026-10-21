import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddRoleHoldingMutation } from '../api';
import { toHoldingConsequence, toPersonName } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';
import { RoleHoldingAddFormSchema } from '../schemas';

export interface HoldingOpeningControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  personError: string | undefined;
  sinceOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useHoldingOpening = (
  role: Pick<RoleSummary, 'roleId' | 'name'>,
  today: string,
  onDone: () => void,
): HoldingOpeningControl => {
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [tried, setTried] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useAddRoleHoldingMutation(role.roleId, role.name);
  const parsed = RoleHoldingAddFormSchema.safeParse({ person, sinceOn });
  const issues = parsed.success || !tried ? [] : parsed.error.issues;
  const issueOf = (field: string): string | undefined =>
    issues.find((issue) => issue.path[0] === field)?.message;

  const submit = (): void => {
    setTried(true);
    setRejection(null);
    if (!parsed.success) {
      return;
    }

    const chosen = parsed.data;

    void mutation
      .mutateAsync({
        personId: chosen.person.personId,
        personName: toPersonName(chosen.person),
        sinceOn: chosen.sinceOn,
      })
      .then(onDone, (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      });
  };

  return {
    person,
    select: setPerson,
    clearPerson: () => {
      setPerson(null);
    },
    sinceOn,
    setSinceOn,
    personError: issueOf('person'),
    sinceOnError: issueOf('sinceOn'),
    consequence:
      person === null || sinceOn === null
        ? null
        : toHoldingConsequence(toPersonName(person), role.name, sinceOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};
