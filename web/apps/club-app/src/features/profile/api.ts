import { useKkToast } from '@furria/ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import type { Me } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toVisibilitySavedMessage } from './profile-labels';
import { toVisibilityErrorMessage } from './profile-messages';
import { requestContactVisibility } from './requests';

interface ContactVisibilityRollback {
  previous: Me | undefined;
}

const applyVisibility = (current: Me | undefined, visible: boolean): Me | undefined => {
  if (current === undefined) {
    return undefined;
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
  const showToast = useKkToast();

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
      showToast({ tone: 'success', message: toVisibilitySavedMessage(visible) });
    },
    onError: (error, _visible, context) => {
      queryClient.setQueryData(ME_QUERY_KEY, context?.previous);
      const message = toVisibilityErrorMessage(error);

      if (message !== null) {
        showToast({ tone: 'error', message });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};
