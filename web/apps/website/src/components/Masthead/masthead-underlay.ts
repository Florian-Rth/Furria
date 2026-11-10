export const MASTHEAD_PHOTO_UNDERLAY_ATTR = 'data-kk-masthead-photo-underlay';

export const MASTHEAD_PHOTO_UNDERLAY_PROPS = { [MASTHEAD_PHOTO_UNDERLAY_ATTR]: true } as const;

export const MASTHEAD_RESTING_OVER_PHOTO = `body:has([${MASTHEAD_PHOTO_UNDERLAY_ATTR}]) [data-kk-masthead-scrolled="false"] &`;
