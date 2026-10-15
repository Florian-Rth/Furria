import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
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

export const useManagedVenuesQuery = (
  enabled = true,
): UseQueryResult<ManagedVenuesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.managedVenues,
    queryFn: () => withFreshAccessToken(requestManagedVenues),
    enabled,
  });

export const useCreateVenueMutation = (): UseMutationResult<CreatedVenue, Error, VenueForm> =>
  useApiMutation({
    request: requestVenueCreation,
    changes: ['venue'],
    notice: { success: (form) => toVenueCreatedMessage(form.name) },
  });

export const useUpdateVenueMutation = (): UseMutationResult<void, Error, UpdateVenueInput> =>
  useApiMutation({
    request: (input: UpdateVenueInput, accessToken) =>
      requestVenueUpdate(input.venueId, input.form, accessToken),
    changes: ['venue'],
    notice: { success: (input) => toVenueSavedMessage(input.form.name) },
  });

export const useArchiveVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> =>
  useApiMutation({
    request: (input: VenueMutationInput, accessToken) =>
      requestVenueArchival(input.venueId, accessToken),
    changes: ['venue'],
    notice: { success: (input) => toVenueArchivedMessage(input.name) },
  });

export const useRestoreVenueMutation = (): UseMutationResult<void, Error, VenueMutationInput> =>
  useApiMutation({
    request: (input: VenueMutationInput, accessToken) =>
      requestVenueRestoration(input.venueId, accessToken),
    changes: ['venue'],
    notice: { success: (input) => toVenueRestoredMessage(input.name) },
  });
