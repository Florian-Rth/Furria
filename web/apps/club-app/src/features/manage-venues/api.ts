import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
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

export const MANAGED_VENUES_QUERY_KEY = ['manage', 'venues'] as const;

export interface VenueMutationInput {
  venueId: number;
  name: string;
}

export interface UpdateVenueInput {
  venueId: number;
  form: VenueForm;
}

const refreshVenues = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: MANAGED_VENUES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: MANAGE_HUB_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

export const useManagedVenuesQuery = (): UseQueryResult<ManagedVenuesResponse, Error> =>
  useQuery({
    queryKey: MANAGED_VENUES_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManagedVenues),
  });

export const useCreateVenueMutation = (): UseMutationResult<CreatedVenue, Error, VenueForm> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (form: VenueForm) =>
      withFreshAccessToken((accessToken) => requestVenueCreation(form, accessToken)),
    onSuccess: (_created, form) => {
      raiseNotice({ tone: 'success', message: toVenueCreatedMessage(form.name) });
      refreshVenues(queryClient);
    },
  });
};

export const useUpdateVenueMutation = (): UseMutationResult<void, Error, UpdateVenueInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: UpdateVenueInput) =>
      withFreshAccessToken((accessToken) =>
        requestVenueUpdate(input.venueId, input.form, accessToken),
      ),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueSavedMessage(input.form.name) });
      refreshVenues(queryClient);
    },
  });
};

export const useArchiveVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: VenueMutationInput) =>
      withFreshAccessToken((accessToken) => requestVenueArchival(input.venueId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueArchivedMessage(input.name) });
      refreshVenues(queryClient);
    },
  });
};

export const useRestoreVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (input: VenueMutationInput) =>
      withFreshAccessToken((accessToken) => requestVenueRestoration(input.venueId, accessToken)),
    onSuccess: (_result, input) => {
      raiseNotice({ tone: 'success', message: toVenueRestoredMessage(input.name) });
      refreshVenues(queryClient);
    },
  });
};
