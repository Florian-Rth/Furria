import { useSetOfficePublicationMutation } from '../api';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toPublicationErrorMessage } from '../manage-board-messages';

export interface OfficePublicationControl {
  isPublic: boolean;
  toggle: (isPublic: boolean) => void;
  isSaving: boolean;
  error: string | undefined;
}

export const useOfficePublication = (entry: BoardOfficeEntry): OfficePublicationControl => {
  const mutation = useSetOfficePublicationMutation(entry.boardOfficeId);

  const toggle = (isPublic: boolean): void => {
    mutation.mutate({ officeName: entry.name, isPublic });
  };

  return {
    isPublic: entry.isPublic,
    toggle,
    isSaving: mutation.isPending,
    error: toPublicationErrorMessage(mutation.error) ?? undefined,
  };
};
