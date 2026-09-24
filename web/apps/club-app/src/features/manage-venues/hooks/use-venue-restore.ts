import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useRestoreVenueMutation } from '../api';
import type { ManagedVenue } from '../schemas';

export interface VenueRestoreControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useVenueRestore = (venue: ManagedVenue): VenueRestoreControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useRestoreVenueMutation();

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
      { venueId: venue.venueId, name: venue.name },
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
