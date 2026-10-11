import type { UseMutationResult } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import type { Me } from '@/lib/api/schemas';
import { CONTACT_DETAILS_SAVED_MESSAGE, toVisibilitySavedMessage } from './profile-labels';
import { toVisibilityErrorMessage } from './profile-messages';
import { requestContactDetailsUpdate, requestContactVisibility } from './requests';
import type { ContactDetailsForm } from './schemas';

const applyVisibility = (current: Me | undefined, visible: boolean): Me | undefined => {
  if (current === undefined || current.person === null) {
    return current;
  }

  return { ...current, person: { ...current.person, contactVisibleToMembers: visible } };
};

export const useContactVisibilityMutation = (): UseMutationResult<void, Error, boolean> =>
  useApiMutation({
    request: requestContactVisibility,
    optimistic: [optimisticPatch(ME_QUERY_KEY, applyVisibility)],
    invalidates: [],
    notice: { success: toVisibilitySavedMessage, failure: toVisibilityErrorMessage },
  });

export const useUpdateContactDetailsMutation = (): UseMutationResult<
  void,
  Error,
  ContactDetailsForm
> =>
  useApiMutation({
    request: requestContactDetailsUpdate,
    invalidates: [ME_QUERY_KEY],
    notice: { success: () => CONTACT_DETAILS_SAVED_MESSAGE },
  });
