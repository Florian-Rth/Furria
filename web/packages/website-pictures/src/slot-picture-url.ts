export type SlotRendition = 'small' | 'medium' | 'large';

const PUBLIC_WEBSITE_PICTURES_PATH = '/api/public/website-pictures';

export const slotPictureUrlOf = (
  slot: string,
  position: number,
  rendition: SlotRendition,
): string => `${PUBLIC_WEBSITE_PICTURES_PATH}/${encodeURIComponent(slot)}/${position}/${rendition}`;
