import { FeaturedAlbumCaption } from './internal/layout/FeaturedAlbumCaption';
import { FeaturedAlbumOverlay } from './internal/layout/FeaturedAlbumOverlay';
import { FeaturedAlbumRoot } from './internal/layout/FeaturedAlbumRoot';
import { FeaturedAlbumAction } from './internal/ui/FeaturedAlbumAction';
import { FeaturedAlbumCover } from './internal/ui/FeaturedAlbumCover';
import { FeaturedAlbumFlag } from './internal/ui/FeaturedAlbumFlag';
import { FeaturedAlbumMeta } from './internal/ui/FeaturedAlbumMeta';
import { FeaturedAlbumTitle } from './internal/ui/FeaturedAlbumTitle';

export const FeaturedAlbum = Object.assign(FeaturedAlbumRoot, {
  Cover: FeaturedAlbumCover,
  Overlay: FeaturedAlbumOverlay,
  Caption: FeaturedAlbumCaption,
  Flag: FeaturedAlbumFlag,
  Title: FeaturedAlbumTitle,
  Meta: FeaturedAlbumMeta,
  Action: FeaturedAlbumAction,
});
