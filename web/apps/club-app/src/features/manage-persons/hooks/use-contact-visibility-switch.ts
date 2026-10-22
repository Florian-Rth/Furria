import { useKkNotice } from '@furria/ui/KkNotice';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdatePersonMutation } from '../api';
import type { PersonDetails } from '../schemas';
import { toPersonFormValues } from './use-person-editor';

export interface ContactVisibilitySwitchControl {
  checked: boolean;
  busy: boolean;
  onChange: (next: boolean) => void;
}

export const useContactVisibilitySwitch = (
  person: PersonDetails,
): ContactVisibilitySwitchControl => {
  const mutation = useUpdatePersonMutation(person.personId);
  const raiseNotice = useKkNotice();

  const onChange = (next: boolean): void => {
    void mutation
      .mutateAsync(toPersonFormValues(person, { contactVisibleToMembers: next }))
      .catch((error: Error) => {
        const message = toWriteErrorMessage(error);

        if (message !== null) {
          raiseNotice({ tone: 'error', message });
        }
      });
  };

  return { checked: person.contactVisibleToMembers, busy: mutation.isPending, onChange };
};
