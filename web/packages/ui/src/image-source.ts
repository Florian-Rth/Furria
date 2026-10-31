import type { KkAspect } from './image-aspect';
import { aspectOf } from './image-aspect';

export interface KkPictureUrls {
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

export interface KkImageSource {
  src: string;
  srcSet?: string;
  sizes?: string;
}

const LONG_EDGES = { small: 640, medium: 1600, large: 2560 } as const;

type Rendition = keyof typeof LONG_EDGES;

const EVERY_RENDITION: readonly Rendition[] = ['small', 'medium', 'large'];
const VIEW_RENDITIONS: readonly Rendition[] = ['medium', 'large'];

const URL_KEYS: Record<Rendition, keyof KkPictureUrls> = {
  small: 'smallUrl',
  medium: 'mediumUrl',
  large: 'largeUrl',
};

const widthOf = (longEdge: number, ratio: number): number =>
  Math.round(ratio >= 1 ? longEdge : longEdge * ratio);

const sourceSetOf = (
  urls: KkPictureUrls,
  renditions: readonly Rendition[],
  ratio: number,
): string =>
  renditions
    .map((rendition) => `${urls[URL_KEYS[rendition]]} ${widthOf(LONG_EDGES[rendition], ratio)}w`)
    .join(', ');

export const toImageSource = (
  urls: KkPictureUrls | null,
  aspect: KkAspect,
  sizes?: string,
): KkImageSource | null =>
  urls === null
    ? null
    : { src: urls.mediumUrl, srcSet: sourceSetOf(urls, EVERY_RENDITION, aspectOf(aspect)), sizes };

export const toViewImageSource = (
  urls: KkPictureUrls,
  aspect: KkAspect,
  sizes: string,
): KkImageSource => ({
  src: urls.mediumUrl,
  srcSet: sourceSetOf(urls, VIEW_RENDITIONS, aspectOf(aspect)),
  sizes,
});
