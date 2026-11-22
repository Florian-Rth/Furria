import type { UseMutationResult } from '@tanstack/react-query';
import { requestBeerListEnrollment, requestBeerListLeave } from '@/features/beer-list/requests';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import type { Me } from '@/lib/api/schemas';
import { queryKeys } from '@/lib/query/reads';
import { BEER_LIST_ENROLLED_MESSAGE, BEER_LIST_LEFT_MESSAGE } from './profile-beer-list-labels';
import {
  CONTACT_DETAILS_SAVED_MESSAGE,
  toClubGroupConsentSavedMessage,
  toVisibilitySavedMessage,
} from './profile-labels';
import { toVisibilityErrorMessage } from './profile-messages';
import {
  requestClubGroupConsent,
  requestContactDetailsUpdate,
  requestContactVisibility,
} from './requests';
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
    optimistic: [optimisticPatch(queryKeys.me, applyVisibility)],
    changes: ['person'],
    notice: { success: toVisibilitySavedMessage, failure: toVisibilityErrorMessage },
  });

const applyClubGroupConsent = (current: Me | undefined, consent: boolean): Me | undefined => {
  if (current === undefined || current.person === null) {
    return current;
  }

  return { ...current, person: { ...current.person, clubGroupConsent: consent } };
};

export const useClubGroupConsentMutation = (): UseMutationResult<void, Error, boolean> =>
  useApiMutation({
    request: requestClubGroupConsent,
    optimistic: [optimisticPatch(queryKeys.me, applyClubGroupConsent)],
    changes: ['person'],
    notice: { success: toClubGroupConsentSavedMessage, failure: toVisibilityErrorMessage },
  });

export const useUpdateContactDetailsMutation = (): UseMutationResult<
  void,
  Error,
  ContactDetailsForm
> =>
  useApiMutation({
    request: requestContactDetailsUpdate,
    changes: ['person'],
    notice: { success: () => CONTACT_DETAILS_SAVED_MESSAGE },
  });

export const useBeerListEnrollMutation = (): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestBeerListEnrollment(accessToken),
    changes: ['beerListEnrollment'],
    notice: { success: () => BEER_LIST_ENROLLED_MESSAGE, failure: () => null },
  });

export const useBeerListLeaveMutation = (): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestBeerListLeave(accessToken),
    changes: ['beerListEnrollment'],
    notice: { success: () => BEER_LIST_LEFT_MESSAGE, failure: () => null },
  });
