import { useKkNotice } from '@furria/ui';
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
    mutation.mutate(toPersonFormValues(person, { contactVisibleToMembers: next }), {
      onError: (error) => {
        const message = toWriteErrorMessage(error);

        if (message !== null) {
          raiseNotice({ tone: 'error', message });
        }
      },
    });
  };

  return { checked: person.contactVisibleToMembers, busy: mutation.isPending, onChange };
};
