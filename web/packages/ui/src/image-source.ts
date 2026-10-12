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

const LONG_EDGES = { small: 400, medium: 1600, large: 2560 } as const;

const widthOf = (longEdge: number, ratio: number): number =>
  Math.round(ratio >= 1 ? longEdge : longEdge * ratio);

const sourceSetOf = (urls: KkPictureUrls, ratio: number): string =>
  [
    `${urls.smallUrl} ${widthOf(LONG_EDGES.small, ratio)}w`,
    `${urls.mediumUrl} ${widthOf(LONG_EDGES.medium, ratio)}w`,
    `${urls.largeUrl} ${widthOf(LONG_EDGES.large, ratio)}w`,
  ].join(', ');

export const toImageSource = (
  urls: KkPictureUrls | null,
  aspect: KkAspect,
  sizes?: string,
): KkImageSource | null =>
  urls === null
    ? null
    : { src: urls.mediumUrl, srcSet: sourceSetOf(urls, aspectOf(aspect)), sizes };
