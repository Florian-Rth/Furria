import type { KkCrop } from '@furria/ui';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { PictureTarget } from './picture-target';
import { toPicturePath } from './picture-target';

export const requestPictureCrop = (
  target: PictureTarget,
  crop: KkCrop,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toPicturePath(target)}/crop`, {
    method: 'PUT',
    body: { left: crop.left, top: crop.top, width: crop.width, height: crop.height },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPictureRemoval = (target: PictureTarget, accessToken: string): Promise<void> =>
  apiFetch(toPicturePath(target), { method: 'DELETE', schema: NoContentSchema, accessToken });
