import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import type { AdminAppointmentControl } from './use-admin-appointment';
import { useAdminAppointment } from './use-admin-appointment';

interface AddAdminFormInput {
  groupId: number;
  open: boolean;
  onAppointed: (personId: number) => void;
}

export interface AddAdminFormControl extends AdminAppointmentControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
}

export const useAddAdminForm = ({
  groupId,
  open,
  onAppointed,
}: AddAdminFormInput): AddAdminFormControl => {
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const appointment = useAdminAppointment({ groupId, person, open, onAppointed });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
    }
  }

  const clearPerson = (): void => {
    setPerson(null);
    appointment.clearRejection();
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    appointment.clearRejection();
  };

  return { ...appointment, person, select, clearPerson };
};
