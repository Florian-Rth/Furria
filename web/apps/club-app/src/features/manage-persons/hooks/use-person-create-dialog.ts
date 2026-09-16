import { useNavigate } from '@tanstack/react-router';
import type { CreatedPerson } from '../schemas';
import { usePersonFormDialog } from './use-person-form-dialog';

const PERSON_PATH = '/manage/persons/$personId';

export interface PersonCreateDialogControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  goToCreated: (created: CreatedPerson) => void;
}

export const usePersonCreateDialog = (): PersonCreateDialogControl => {
  const dialog = usePersonFormDialog();
  const navigate = useNavigate();

  return {
    isOpen: dialog.isOpen,
    open: dialog.open,
    close: dialog.close,
    goToCreated: (created) => {
      dialog.close();
      void navigate({ to: PERSON_PATH, params: { personId: String(created.personId) } });
    },
  };
};
