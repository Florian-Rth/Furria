import type { KkAspect } from '@furria/ui/image-aspect';
import type { KkPictureUrls } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import { KK_DESKTOP_BREAKPOINT } from '@furria/ui/theme';
import type { PictureSlotKey } from '@furria/website-pictures';
import { slotPictureUrlOf, WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import type { HtmlTagDescriptor } from 'vite';
import { LANDING_HERO_PHONE_SIZES, LANDING_HERO_SIZES } from './landing-hero-sizes';

const FIRST_POSITION = 1;
const MEDIA_QUERY_EPSILON = 0.02;
const DESKTOP_MEDIA = `(min-width: ${KK_DESKTOP_BREAKPOINT}px)`;
const PHONE_MEDIA = `(max-width: ${KK_DESKTOP_BREAKPOINT - MEDIA_QUERY_EPSILON}px)`;

const firstAspectOf = (slot: PictureSlotKey): KkAspect => WEBSITE_PICTURE_SLOTS[slot].positions[0];

const slotPictureUrlsOf = (slot: PictureSlotKey): KkPictureUrls => ({
  smallUrl: slotPictureUrlOf(slot, FIRST_POSITION, 'small'),
  mediumUrl: slotPictureUrlOf(slot, FIRST_POSITION, 'medium'),
  largeUrl: slotPictureUrlOf(slot, FIRST_POSITION, 'large'),
});

const heroPreloadOf = (slot: PictureSlotKey, sizes: string, media: string): HtmlTagDescriptor => {
  const image = toImageSource(slotPictureUrlsOf(slot), firstAspectOf(slot), sizes);

  return {
    tag: 'link',
    attrs: {
      rel: 'preload',
      as: 'image',
      href: image?.src,
      imagesrcset: image?.srcSet,
      imagesizes: image?.sizes,
      media,
      fetchpriority: 'high',
    },
    injectTo: 'head',
  };
};

export const websitePictureHeadTags = (): HtmlTagDescriptor[] => [
  heroPreloadOf('landing.hero', LANDING_HERO_SIZES, DESKTOP_MEDIA),
  heroPreloadOf('landing.heroPhone', LANDING_HERO_PHONE_SIZES, PHONE_MEDIA),
];
