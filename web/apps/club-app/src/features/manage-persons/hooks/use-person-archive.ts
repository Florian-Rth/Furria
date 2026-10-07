import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useSetPersonArchivedMutation } from '../api';
import { toPersonName } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

export interface PersonArchiveControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const usePersonArchive = (person: PersonDetails): PersonArchiveControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useSetPersonArchivedMutation(person.personId);

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      { isArchived: person.archive === null, personName: toPersonName(person) },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
