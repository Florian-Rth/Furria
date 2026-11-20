import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  requestWhatsAppClubGroup,
  requestWhatsAppLinking,
  requestWhatsAppOverview,
  requestWhatsAppPairingCode,
  requestWhatsAppQrCode,
} from './requests';
import type { WhatsAppOverview, WhatsAppPairingCode, WhatsAppQrCode } from './schemas';
import { CLUB_GROUP_PICKED_NOTICE, LINKING_STARTED_NOTICE } from './whatsapp-copy';
import { overviewPollDelayOf } from './whatsapp-polling';

const QR_CODE_POLL_MS = 15_000;

export const useWhatsAppOverviewQuery = (): UseQueryResult<WhatsAppOverview, Error> =>
  useQuery({
    queryKey: queryKeys.whatsAppOverview,
    queryFn: () => withFreshAccessToken(requestWhatsAppOverview),
    refetchInterval: (query) => overviewPollDelayOf(query.state.data?.state),
  });

export const useWhatsAppQrCodeQuery = (): UseQueryResult<WhatsAppQrCode, Error> =>
  useQuery({
    queryKey: queryKeys.whatsAppQrCode,
    queryFn: () => withFreshAccessToken(requestWhatsAppQrCode),
    refetchInterval: QR_CODE_POLL_MS,
    staleTime: 0,
    gcTime: 0,
  });

export const useStartWhatsAppLinkingMutation = (): UseMutationResult<void, Error, undefined> =>
  useApiMutation({
    request: (_input: undefined, accessToken: string) => requestWhatsAppLinking(accessToken),
    changes: ['whatsApp'],
    notice: { success: () => LINKING_STARTED_NOTICE, failure: toWriteErrorMessage },
  });

export const useWhatsAppPairingCodeMutation = (): UseMutationResult<
  WhatsAppPairingCode,
  Error,
  string
> =>
  useApiMutation({
    request: requestWhatsAppPairingCode,
    changes: [],
    notice: { failure: toWriteErrorMessage },
  });

export const usePickWhatsAppClubGroupMutation = (): UseMutationResult<void, Error, string> =>
  useApiMutation({
    request: requestWhatsAppClubGroup,
    changes: ['whatsApp'],
    notice: { success: () => CLUB_GROUP_PICKED_NOTICE, failure: toWriteErrorMessage },
  });
