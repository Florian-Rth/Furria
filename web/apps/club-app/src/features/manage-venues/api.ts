import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import {
  toVenueArchivedMessage,
  toVenueCreatedMessage,
  toVenueRestoredMessage,
  toVenueSavedMessage,
} from './manage-venues-labels';
import {
  requestManagedVenues,
  requestVenueArchival,
  requestVenueCreation,
  requestVenueRestoration,
  requestVenueUpdate,
} from './requests';
import type { CreatedVenue, ManagedVenuesResponse, VenueForm } from './schemas';

export interface VenueMutationInput {
  venueId: number;
  name: string;
}

export interface UpdateVenueInput {
  venueId: number;
  form: VenueForm;
}

export const useManagedVenuesQuery = (): UseQueryResult<ManagedVenuesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedVenues,
    queryFn: () => withFreshAccessToken(requestManagedVenues),
  });

export const useCreateVenueMutation = (): UseMutationResult<CreatedVenue, Error, VenueForm> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['venue'] },
    mutationFn: (form: VenueForm) =>
      withFreshAccessToken((accessToken) => requestVenueCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toVenueCreatedMessage(form.name) });
    },
  });
};

export const useUpdateVenueMutation = (): UseMutationResult<void, Error, UpdateVenueInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['venue'] },
    mutationFn: (input: UpdateVenueInput) =>
      withFreshAccessToken((accessToken) =>
        requestVenueUpdate(input.venueId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueSavedMessage(input.form.name) });
    },
  });
};

export const useArchiveVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['venue'] },
    mutationFn: (input: VenueMutationInput) =>
      withFreshAccessToken((accessToken) => requestVenueArchival(input.venueId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueArchivedMessage(input.name) });
    },
  });
};

export const useRestoreVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['venue'] },
    mutationFn: (input: VenueMutationInput) =>
      withFreshAccessToken((accessToken) => requestVenueRestoration(input.venueId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueRestoredMessage(input.name) });
    },
  });
};
