export interface KkPictureUrls {
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

const LONG_EDGES = { small: 400, medium: 1600, large: 2560 } as const;

const widthOf = (longEdge: number, aspect: number): number =>
  Math.round(aspect >= 1 ? longEdge : longEdge * aspect);

export const toPictureSourceSet = (urls: KkPictureUrls, aspect: number): string =>
  [
    `${urls.smallUrl} ${widthOf(LONG_EDGES.small, aspect)}w`,
    `${urls.mediumUrl} ${widthOf(LONG_EDGES.medium, aspect)}w`,
    `${urls.largeUrl} ${widthOf(LONG_EDGES.large, aspect)}w`,
  ].join(', ');
