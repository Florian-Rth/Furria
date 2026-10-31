import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toCoEditorGrantedMessage, toCoEditorRevokedMessage } from './acts-copy';
import {
  requestActStudio,
  requestCoEditorGrant,
  requestCoEditorRevoke,
  requestGroupActs,
  requestMyActs,
} from './requests';
import type { ActStudioResponse, GroupActsResponse, MyActsResponse } from './schemas';

export interface CoEditorInput {
  personId: number;
  name: string;
}

export interface CoEditorMutations {
  grant: UseMutationResult<void, Error, CoEditorInput>;
  revoke: UseMutationResult<void, Error, CoEditorInput>;
}

export const useActStudioQuery = (actId: number | null): UseQueryResult<ActStudioResponse, Error> =>
  useQuery({
    queryKey: queryKeys.actStudio(actId),
    queryFn:
      actId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestActStudio(actId, accessToken)),
  });

export const useGroupActsQuery = (groupId: number): UseQueryResult<GroupActsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.groupActs(groupId),
    queryFn: () => withFreshAccessToken((accessToken) => requestGroupActs(groupId, accessToken)),
  });

export const useMyActsQuery = (mayRead = true): UseQueryResult<MyActsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.myActs,
    queryFn: mayRead ? () => withFreshAccessToken(requestMyActs) : skipToken,
  });

export const useCoEditorMutations = (actId: number): CoEditorMutations => {
  const grant = useApiMutation({
    request: ({ personId }: CoEditorInput, accessToken) =>
      requestCoEditorGrant(actId, personId, accessToken),
    changes: ['actCoEditor'],
    notice: {
      success: ({ name }: CoEditorInput) => toCoEditorGrantedMessage(name),
      failure: toWriteErrorMessage,
    },
  });
  const revoke = useApiMutation({
    request: ({ personId }: CoEditorInput, accessToken) =>
      requestCoEditorRevoke(actId, personId, accessToken),
    changes: ['actCoEditor'],
    notice: {
      success: ({ name }: CoEditorInput) => toCoEditorRevokedMessage(name),
      failure: toWriteErrorMessage,
    },
  });

  return { grant, revoke };
};
