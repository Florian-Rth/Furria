import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import {
  requestUploadLinkCreation,
  requestUploadLinkLookup,
  requestUploadLinkRevocation,
  requestUploadLinks,
} from './requests';
import type { CreatedUploadLink, UploadLinkLookup, UploadLinks } from './schemas';
import { REVOKED_NOTICE } from './upload-link-copy';

export const useUploadLinksQuery = (enabled = true): UseQueryResult<UploadLinks, Error> =>
  useQuery({
    queryKey: queryKeys.uploadLinks,
    queryFn: () => withFreshAccessToken(requestUploadLinks),
    enabled,
  });

export const useUploadLinkCreation = (): UseMutationResult<CreatedUploadLink, Error, string> =>
  useApiMutation({ request: requestUploadLinkCreation, changes: ['media'] });

export const useUploadLinkRevocation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestUploadLinkRevocation,
    changes: ['media'],
    notice: { success: () => REVOKED_NOTICE },
  });

export const useUploadLinkLookupQuery = (
  token: string | null,
): UseQueryResult<UploadLinkLookup, Error> =>
  useQuery({
    queryKey: queryKeys.uploadLinkLookup(token ?? ''),
    queryFn: token === null ? skipToken : () => requestUploadLinkLookup(token),
    retry: false,
  });
