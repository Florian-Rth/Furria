import type { PictureSlotKey } from '@furria/website-pictures';
import { WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import { publicWebsitePictures } from './api';
import { filledPositionsOf, framedPositionsOf } from './slot-picture';

export const useFilledSlotPositions = (key: PictureSlotKey): number[] =>
  filledPositionsOf(publicWebsitePictures.useSource(), key, WEBSITE_PICTURE_SLOTS[key]);

export const useFramedSlotPositions = (key: PictureSlotKey): number[] =>
  framedPositionsOf(publicWebsitePictures.useSource(), key, WEBSITE_PICTURE_SLOTS[key]);
