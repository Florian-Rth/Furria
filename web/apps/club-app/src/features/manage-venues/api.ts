import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { MANAGE_HUB_QUERY_KEY } from '@/features/manage-hub';
import { useApiMutation } from '@/lib/api/api-mutation';
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

const VENUES_SCOPE = [MANAGED_VENUES_QUERY_KEY, MANAGE_HUB_QUERY_KEY, CLUB_HUB_QUERY_KEY] as const;

export const useManagedVenuesQuery = (): UseQueryResult<ManagedVenuesResponse, Error> =>
  useQuery({
    queryKey: MANAGED_VENUES_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestManagedVenues),
  });

export const useCreateVenueMutation = (): UseMutationResult<CreatedVenue, Error, VenueForm> =>
  useApiMutation({
    request: requestVenueCreation,
    invalidates: VENUES_SCOPE,
    notice: { success: (form) => toVenueCreatedMessage(form.name) },
  });

export const useUpdateVenueMutation = (): UseMutationResult<void, Error, UpdateVenueInput> =>
  useApiMutation({
    request: (input: UpdateVenueInput, accessToken) =>
      requestVenueUpdate(input.venueId, input.form, accessToken),
    invalidates: VENUES_SCOPE,
    notice: { success: (input) => toVenueSavedMessage(input.form.name) },
  });

export const useArchiveVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> =>
  useApiMutation({
    request: (input: VenueMutationInput, accessToken) =>
      requestVenueArchival(input.venueId, accessToken),
    invalidates: VENUES_SCOPE,
    notice: { success: (input) => toVenueArchivedMessage(input.name) },
  });

export const useRestoreVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> =>
  useApiMutation({
    request: (input: VenueMutationInput, accessToken) =>
      requestVenueRestoration(input.venueId, accessToken),
    invalidates: VENUES_SCOPE,
    notice: { success: (input) => toVenueRestoredMessage(input.name) },
  });
