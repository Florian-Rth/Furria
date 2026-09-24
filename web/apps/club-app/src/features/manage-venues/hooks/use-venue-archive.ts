import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useArchiveVenueMutation } from '../api';
import type { ManagedVenue } from '../schemas';

export interface VenueArchiveControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useVenueArchive = (venue: ManagedVenue): VenueArchiveControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useArchiveVenueMutation();
  const navigate = useNavigate();

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
          void navigate({ to: '/manage/venues' });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
