import { useKkNotice } from '@furria/ui';
import type { ReauthenticationControl } from '@/features/account-security';
import { useReauthentication } from '@/features/account-security';
import { useMeQuery } from '@/features/session';
import { useGoBackTo } from '@/lib/use-go-back-to';
import type { PersonErasureOutcome } from '../api';
import { useForgetErasedPerson, usePersonErasureMutation } from '../api';
import { toPersonName } from '../manage-persons-labels';
import type { ErasureNotice } from '../person-deletion';
import {
  toErasureNotice,
  toPersonAlreadyErasedMessage,
  toPersonErasedMessage,
} from '../person-deletion';
import type { PersonDetails } from '../schemas';

const PERSONS_PATH = '/manage/persons';

export interface PersonDeletionControl {
  proof: ReauthenticationControl;
  isSelf: boolean;
  notice: ErasureNotice;
}

export const usePersonDeletion = (person: PersonDetails): PersonDeletionControl => {
  const me = useMeQuery();
  const isSelf = me.data?.person?.id === person.personId;
  const hasPasskeys = (me.data?.passkeys.length ?? 0) > 0;
  const mutation = usePersonErasureMutation(person.personId, isSelf);
  const forgetErasedPerson = useForgetErasedPerson();
  const raiseNotice = useKkNotice();
  const goBackTo = useGoBackTo();

  const landOnRegister = (outcome: PersonErasureOutcome): void => {
    if (isSelf) {
      return;
    }

    const personName = toPersonName(person);
    raiseNotice(
      outcome === 'erased'
        ? { tone: 'success', message: toPersonErasedMessage(personName) }
        : { tone: 'info', message: toPersonAlreadyErasedMessage(personName) },
    );
    void goBackTo({ to: PERSONS_PATH, ignoreBlocker: true }).then(() => {
      forgetErasedPerson(person.personId);
    });
  };

  const proof = useReauthentication(hasPasskeys, mutation, landOnRegister);

  return { proof, isSelf, notice: toErasureNotice(isSelf, person.access.state) };
};
