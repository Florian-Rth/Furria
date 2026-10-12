import type { JsonBody } from '@furria/api-client';
import type { KkCrop } from '@furria/ui';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { WebsitePictures } from './schemas';
import { PlacedWebsitePictureSchema, WebsitePicturesSchema } from './schemas';
import type { SlotPositionRef } from './types';

const WEBSITE_PICTURES_PATH = '/api/website-pictures';

export interface WebsiteCropPayload {
  at: SlotPositionRef;
  crop: KkCrop;
  aspect: number;
}

export interface WebsiteAltPayload {
  at: SlotPositionRef;
  alt: string | null;
}

export interface WebsiteGalleryPickPayload extends WebsiteCropPayload {
  galleryItemId: number;
}

export interface WebsiteSlotCopyPayload extends WebsiteCropPayload {
  source: SlotPositionRef;
}

export interface WebsiteTransferPayload {
  from: SlotPositionRef;
  to: SlotPositionRef;
}

const positionPath = ({ slot, position }: SlotPositionRef): string =>
  `${WEBSITE_PICTURES_PATH}/${encodeURIComponent(slot)}/${position}`;

const cutBodyOf = ({ crop, aspect }: WebsiteCropPayload): { [key: string]: JsonBody } => ({
  left: crop.left,
  top: crop.top,
  width: crop.width,
  height: crop.height,
  aspect,
});

export const requestWebsitePictures = (accessToken: string): Promise<WebsitePictures> =>
  apiFetch(WEBSITE_PICTURES_PATH, { schema: WebsitePicturesSchema, accessToken });

export const requestWebsitePictureCrop = (
  payload: WebsiteCropPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${positionPath(payload.at)}/crop`, {
    method: 'PUT',
    body: cutBodyOf(payload),
    schema: NoContentSchema,
    accessToken,
  });

export const requestWebsitePictureAlt = (
  { at, alt }: WebsiteAltPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${positionPath(at)}/alt`, {
    method: 'PUT',
    body: { alt },
    schema: NoContentSchema,
    accessToken,
  });

export const requestWebsitePictureRemoval = (
  at: SlotPositionRef,
  accessToken: string,
): Promise<void> =>
  apiFetch(positionPath(at), { method: 'DELETE', schema: NoContentSchema, accessToken });

export const requestWebsitePictureFromGallery = async (
  payload: WebsiteGalleryPickPayload,
  accessToken: string,
): Promise<void> => {
  await apiFetch(`${positionPath(payload.at)}/from-gallery`, {
    method: 'POST',
    body: { galleryItemId: payload.galleryItemId, ...cutBodyOf(payload) },
    schema: PlacedWebsitePictureSchema,
    accessToken,
  });
};

export const requestWebsitePictureFromSlot = async (
  payload: WebsiteSlotCopyPayload,
  accessToken: string,
): Promise<void> => {
  await apiFetch(`${positionPath(payload.at)}/from-slot`, {
    method: 'POST',
    body: {
      sourceSlotKey: payload.source.slot,
      sourcePosition: payload.source.position,
      ...cutBodyOf(payload),
    },
    schema: PlacedWebsitePictureSchema,
    accessToken,
  });
};

export const requestWebsitePictureTransfer = (
  { from, to }: WebsiteTransferPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${WEBSITE_PICTURES_PATH}/transfer`, {
    method: 'POST',
    body: {
      fromSlotKey: from.slot,
      fromPosition: from.position,
      toSlotKey: to.slot,
      toPosition: to.position,
    },
    schema: NoContentSchema,
    accessToken,
  });
