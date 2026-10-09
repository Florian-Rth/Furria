import { useKkNotice } from '@furria/ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
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
    meta: { changes: ['person'] },
    mutationFn: (visible: boolean) =>
      withFreshAccessToken((accessToken) => requestContactVisibility(visible, accessToken)),
    onMutate: async (visible) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });
      const previous = queryClient.getQueryData<Me>(queryKeys.me);
      queryClient.setQueryData<Me>(queryKeys.me, (current) => applyVisibility(current, visible));

      return { previous };
    },
    onSuccess: (_result, visible) => {
      raiseNotice({ tone: 'success', message: toVisibilitySavedMessage(visible) });
    },
    onError: (error, _visible, context) => {
      queryClient.setQueryData(queryKeys.me, context?.previous);
      const message = toVisibilityErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
  });
};

export const useUpdateContactDetailsMutation = (): UseMutationResult<
  void,
  Error,
  ContactDetailsForm
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['person'], settlesWhenFresh: true },
    mutationFn: (form: ContactDetailsForm) =>
      withFreshAccessToken((accessToken) => requestContactDetailsUpdate(form, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: CONTACT_DETAILS_SAVED_MESSAGE });
    },
  });
};
