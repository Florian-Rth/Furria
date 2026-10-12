import type { PictureSlotKey } from '@furria/website-pictures';
import { WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import { publicWebsitePictures } from './api';
import type { SlotPicture } from './slot-picture';
import { slotPictureOf } from './slot-picture';

const FIRST_POSITION = 1;

export const useWebsitePicture = (
  key: PictureSlotKey,
  sizes: string,
  position: number = FIRST_POSITION,
): SlotPicture =>
  slotPictureOf(
    publicWebsitePictures.useSource(),
    key,
    WEBSITE_PICTURE_SLOTS[key],
    position,
    sizes,
  );
