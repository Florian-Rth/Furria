import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type {
  WebsiteAltPayload,
  WebsiteCropPayload,
  WebsiteGalleryPickPayload,
  WebsiteSlotCopyPayload,
  WebsiteTransferPayload,
} from './requests';
import {
  requestWebsitePictureAlt,
  requestWebsitePictureCrop,
  requestWebsitePictureFromGallery,
  requestWebsitePictureFromSlot,
  requestWebsitePictureRemoval,
  requestWebsitePictures,
  requestWebsitePictureTransfer,
} from './requests';
import type { WebsitePictures } from './schemas';
import type { SlotPositionRef } from './types';
import { NOTICES } from './website-copy';

export const useWebsitePicturesQuery = (enabled: boolean): UseQueryResult<WebsitePictures, Error> =>
  useQuery({
    queryKey: queryKeys.websitePictures,
    queryFn: () => withFreshAccessToken(requestWebsitePictures),
    enabled,
  });

const useWebsitePictureMutation = <TInput>(
  request: (input: TInput, accessToken: string) => Promise<void>,
  done: string,
): UseMutationResult<void, Error, TInput> =>
  useApiMutation({ request, changes: ['websitePicture'], notice: { success: () => done } });

export const useWebsitePictureCrop = (): UseMutationResult<void, Error, WebsiteCropPayload> =>
  useWebsitePictureMutation(requestWebsitePictureCrop, NOTICES.cropped);

export const useWebsitePictureAlt = (): UseMutationResult<void, Error, WebsiteAltPayload> =>
  useWebsitePictureMutation(requestWebsitePictureAlt, NOTICES.described);

export const useWebsitePictureRemoval = (): UseMutationResult<void, Error, SlotPositionRef> =>
  useWebsitePictureMutation(requestWebsitePictureRemoval, NOTICES.removed);

export const useWebsitePictureFromGallery = (): UseMutationResult<
  void,
  Error,
  WebsiteGalleryPickPayload
> => useWebsitePictureMutation(requestWebsitePictureFromGallery, NOTICES.placed);

export const useWebsitePictureFromSlot = (): UseMutationResult<
  void,
  Error,
  WebsiteSlotCopyPayload
> => useWebsitePictureMutation(requestWebsitePictureFromSlot, NOTICES.placed);

export const useWebsitePictureTransfer = (): UseMutationResult<
  void,
  Error,
  WebsiteTransferPayload
> => useWebsitePictureMutation(requestWebsitePictureTransfer, NOTICES.transferred);
