import { useKkNotice } from '@furria/ui';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useTicketAvailabilityMutation } from '../api';
import type { EventDetails, TicketAvailability } from '../schemas';
import { TicketAvailabilitySchema } from '../schemas';

export interface TicketAvailabilityControl {
  value: TicketAvailability;
  isSaving: boolean;
  choose: (value: string) => void;
}

export const useTicketAvailability = (event: EventDetails): TicketAvailabilityControl => {
  const mutation = useTicketAvailabilityMutation(event);
  const raiseNotice = useKkNotice();
  const value = mutation.isPending
    ? mutation.variables.ticketAvailability
    : event.ticketAvailability;

  const choose = (chosen: string): void => {
    const parsed = TicketAvailabilitySchema.safeParse(chosen);

    if (!parsed.success || parsed.data === value) {
      return;
    }

    mutation.mutate(
      { ticketAvailability: parsed.data },
      {
        onError: (error) => {
          const message = toWriteErrorMessage(error);

          if (message !== null) {
            raiseNotice({ tone: 'error', message });
          }
        },
      },
    );
  };

  return { value, isSaving: mutation.isPending, choose };
};
