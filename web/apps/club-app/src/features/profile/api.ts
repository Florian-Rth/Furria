import { useKkNotice } from '@furria/ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { CONTACT_DETAILS_SAVED_MESSAGE, toVisibilitySavedMessage } from './profile-labels';
import { toVisibilityErrorMessage } from './profile-messages';
import { requestContactDetailsUpdate, requestContactVisibility } from './requests';
import type { ContactDetailsForm } from './schemas';

interface ContactVisibilityRollback {
  previous: Me | undefined;
}

const applyVisibility = (current: Me | undefined, visible: boolean): Me | undefined => {
  if (current === undefined || current.person === null) {
    return current;
  }

  return { ...current, person: { ...current.person, contactVisibleToMembers: visible } };
};

export const useContactVisibilityMutation = (): UseMutationResult<
  void,
  Error,
  boolean,
  ContactVisibilityRollback
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (visible: boolean) =>
      withFreshAccessToken((accessToken) => requestContactVisibility(visible, accessToken)),
    onMutate: async (visible) => {
      await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY });
      const previous = queryClient.getQueryData<Me>(ME_QUERY_KEY);
      queryClient.setQueryData<Me>(ME_QUERY_KEY, (current) => applyVisibility(current, visible));

      return { previous };
    },
    onSuccess: (_result, visible) => {
      raiseNotice({ tone: 'success', message: toVisibilitySavedMessage(visible) });
    },
    onError: (error, _visible, context) => {
      queryClient.setQueryData(ME_QUERY_KEY, context?.previous);
      const message = toVisibilityErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};

export const useUpdateContactDetailsMutation = (): UseMutationResult<
  void,
  Error,
  ContactDetailsForm
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: ContactDetailsForm) =>
      withFreshAccessToken((accessToken) => requestContactDetailsUpdate(form, accessToken)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      raiseNotice({ tone: 'success', message: CONTACT_DETAILS_SAVED_MESSAGE });
    },
  });
};
