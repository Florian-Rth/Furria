import type { KkCrop } from '@furria/ui/image-crop';
import type { NewsAlbumTie, NewsCategory, NewsEventTie, PublishedNewsPost } from './schemas';
import { NewsCategorySchema } from './schemas';

export type { NewsCategory, NewsRequirement } from './schemas';

export const NEWS_CATEGORIES: readonly NewsCategory[] = NewsCategorySchema.options;

export type NewsStage = 'draft' | 'live' | 'pending' | 'withdrawn';

export type NewsPictureState = 'uploading' | 'developing' | 'stalled' | 'ready' | 'failed';

export interface NewsPicture {
  key: string;
  state: NewsPictureState;
  progress: number;
  uncroppedSource: string | null;
  source: string | null;
  crop: KkCrop | null;
}

export interface NewsFields {
  category: NewsCategory | null;
  title: string;
  teaser: string;
  text: string;
  pictureCaption: string;
  eventId: number | null;
  albumId: number | null;
}

export interface NewsVersion extends NewsFields {
  picture: NewsPicture | null;
  event: NewsEventTie | null;
  album: NewsAlbumTie | null;
}

export type NewsPublication = Omit<PublishedNewsPost, 'revision'>;

export interface NewsSaver {
  name: string | null;
  at: string;
}

export type NewsVersionPart =
  | 'category'
  | 'title'
  | 'teaser'
  | 'picture'
  | 'caption'
  | 'text'
  | 'event'
  | 'album';
