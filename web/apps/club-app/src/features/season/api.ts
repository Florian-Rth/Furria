import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { requestRunningOrder, requestRunningOrderSave } from '@/features/running-order/requests';
import { bodyOf, draftOf, EMPTY_DRAFT } from '@/features/running-order/running-order-ops';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { requestActSeason } from './requests';
import type { ActSeasonResponse } from './schemas';
import {
  SEASON_TOGGLE_REFUSED_MESSAGE,
  SEASON_UNDO_LABEL,
  toSeasonToggledMessage,
} from './season-copy';
import { toggledDraftOf } from './season-toggle';

export interface SeasonToggleInput {
  act: CatalogueAct;
  eventId: number;
  eveningTitle: string;
  add: boolean;
}

class SeasonToggleRefusedError extends Error {}

export const useActSeasonQuery = (
  sessionYear: number | null = null,
): UseQueryResult<ActSeasonResponse, Error> =>
  useQuery({
    queryKey: queryKeys.actSeason(sessionYear),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestActSeason(sessionYear, accessToken)),
    placeholderData: keepPreviousData,
  });

const requestSeasonToggle = async (
  { act, eventId, add }: SeasonToggleInput,
  accessToken: string,
): Promise<void> => {
  const order = await requestRunningOrder(eventId, accessToken);
  const toggled = toggledDraftOf(order === null ? EMPTY_DRAFT : draftOf(order), act, add);

  if (toggled === null) {
    throw new SeasonToggleRefusedError();
  }

  await requestRunningOrderSave(eventId, bodyOf(toggled), accessToken);
};

const toToggleFailure = (error: Error): string | null =>
  error instanceof SeasonToggleRefusedError
    ? SEASON_TOGGLE_REFUSED_MESSAGE
    : toWriteErrorMessage(error);

const toToggledMessage = ({ act, eveningTitle, add }: SeasonToggleInput): string =>
  toSeasonToggledMessage(act.name, eveningTitle, add);

export const useSeasonToggleMutation = (): UseMutationResult<void, Error, SeasonToggleInput> => {
  const undo = useApiMutation({
    request: requestSeasonToggle,
    changes: ['runningOrder', 'actEvening'],
    notice: { success: toToggledMessage, failure: toToggleFailure },
  });

  return useApiMutation({
    request: requestSeasonToggle,
    changes: ['runningOrder', 'actEvening'],
    notice: {
      success: (input: SeasonToggleInput): KkNoticeRequest => ({
        tone: 'success',
        message: toToggledMessage(input),
        actions: [
          {
            id: 'undo',
            label: SEASON_UNDO_LABEL,
            onSelect: () => {
              undo.mutate({ ...input, add: !input.add });
            },
          },
        ],
      }),
      failure: toToggleFailure,
    },
  });
};
