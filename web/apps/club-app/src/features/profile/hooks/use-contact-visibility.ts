import { useContactVisibilityMutation } from '../api';
import { toVisibilityErrorMessage } from '../profile-messages';

export interface ContactVisibilityControl {
  isVisible: boolean;
  toggle: (visible: boolean) => void;
  isSaving: boolean;
  error: string | undefined;
}

export const useContactVisibility = (visibleToMembers: boolean): ContactVisibilityControl => {
  const mutation = useContactVisibilityMutation();

  const toggle = (visible: boolean): void => {
    mutation.mutate(visible);
  };

  return {
    isVisible: visibleToMembers,
    toggle,
    isSaving: mutation.isPending,
    error: toVisibilityErrorMessage(mutation.error) ?? undefined,
  };
};
