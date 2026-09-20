import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { VenueMutationInput } from '../api';
import type { ManagedVenue } from '../schemas';

interface VenueConfirmInput {
  mutation: UseMutationResult<void, Error, VenueMutationInput>;
  venue: ManagedVenue | null;
  open: boolean;
  onDone: () => void;
}

export interface VenueConfirmControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useVenueConfirm = ({
  mutation,
  venue,
  open,
  onDone,
}: VenueConfirmInput): VenueConfirmControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setRejection(null);
    }
  }

  const submit = (): void => {
    if (venue === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { venueId: venue.venueId, name: venue.name },
      {
        onSuccess: onDone,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { rejection, isSaving: mutation.isPending, submit };
};
