import type { KkCrop } from '@furria/ui';
import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  CreatedNewsPost,
  GalleryAlbumPhotos,
  NewsCategory,
  NewsHub,
  NewsMentionables,
  NewsPostDetails,
  NewsTieCandidates,
  PublishedNewsPost,
  SavedNewsPost,
} from './schemas';
import {
  CreatedNewsPostSchema,
  GalleryAlbumPhotosSchema,
  NewsHubSchema,
  NewsMentionablesSchema,
  NewsPostDetailsSchema,
  NewsTieCandidatesSchema,
  PickedNewsPictureSchema,
  PublishedNewsPostSchema,
  SavedNewsPostSchema,
} from './schemas';

const NEWS_API_PATH = '/api/news';

export interface NewsContentPayload {
  title: string;
  teaser: string;
  text: string;
  category: NewsCategory | null;
  eventId: number | null;
  albumId: number | null;
  pictureCaption: string | null;
}

export interface NewsSavePayload {
  newsPostId: number;
  basedOnRevision: number;
  content: NewsContentPayload;
}

export interface GalleryPickPayload {
  newsPostId: number;
  galleryItemId: number;
  crop: KkCrop;
}

export interface NewsCropPayload {
  newsPostId: number;
  crop: KkCrop;
}

const postPath = (newsPostId: number): string => `${NEWS_API_PATH}/${newsPostId}`;

const toContentBody = (content: NewsContentPayload): { [key: string]: JsonBody } => ({
  title: content.title,
  teaser: content.teaser,
  text: content.text,
  category: content.category,
  eventId: content.eventId,
  albumId: content.albumId,
});

const toCropBody = (crop: KkCrop): { [key: string]: JsonBody } => ({
  left: crop.left,
  top: crop.top,
  width: crop.width,
  height: crop.height,
});

export const requestNewsHub = (accessToken: string): Promise<NewsHub> =>
  apiFetch(NEWS_API_PATH, { schema: NewsHubSchema, accessToken });

export const requestNewsPost = (
  newsPostId: number,
  accessToken: string,
): Promise<NewsPostDetails> =>
  apiFetch(postPath(newsPostId), { schema: NewsPostDetailsSchema, accessToken });

export const requestNewsMentionables = (accessToken: string): Promise<NewsMentionables> =>
  apiFetch(`${NEWS_API_PATH}/mentionables`, { schema: NewsMentionablesSchema, accessToken });

export const requestNewsTieCandidates = (accessToken: string): Promise<NewsTieCandidates> =>
  apiFetch(`${NEWS_API_PATH}/tie-candidates`, { schema: NewsTieCandidatesSchema, accessToken });

export const requestNewsPostCreation = (
  content: NewsContentPayload,
  accessToken: string,
): Promise<CreatedNewsPost> =>
  apiFetch(NEWS_API_PATH, {
    method: 'POST',
    body: toContentBody(content),
    schema: CreatedNewsPostSchema,
    accessToken,
  });

export const requestNewsPostSave = (
  { newsPostId, basedOnRevision, content }: NewsSavePayload,
  accessToken: string,
): Promise<SavedNewsPost> =>
  apiFetch(postPath(newsPostId), {
    method: 'PUT',
    body: { ...toContentBody(content), basedOnRevision, pictureCaption: content.pictureCaption },
    schema: SavedNewsPostSchema,
    accessToken,
  });

export const requestNewsPublication = (
  newsPostId: number,
  accessToken: string,
): Promise<PublishedNewsPost> =>
  apiFetch(`${postPath(newsPostId)}/publication`, {
    method: 'POST',
    schema: PublishedNewsPostSchema,
    accessToken,
  });

export const requestPendingChangesPublication = (
  newsPostId: number,
  accessToken: string,
): Promise<PublishedNewsPost> =>
  apiFetch(`${postPath(newsPostId)}/pending-changes/publication`, {
    method: 'POST',
    schema: PublishedNewsPostSchema,
    accessToken,
  });

export const requestPendingChangesDiscard = (
  newsPostId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${postPath(newsPostId)}/pending-changes`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestNewsWithdrawal = (newsPostId: number, accessToken: string): Promise<void> =>
  apiFetch(`${postPath(newsPostId)}/publication`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestNewsPostDeletion = (newsPostId: number, accessToken: string): Promise<void> =>
  apiFetch(postPath(newsPostId), { method: 'DELETE', schema: NoContentSchema, accessToken });

export const requestNewsPictureCrop = (
  { newsPostId, crop }: NewsCropPayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${postPath(newsPostId)}/picture/crop`, {
    method: 'PUT',
    body: toCropBody(crop),
    schema: NoContentSchema,
    accessToken,
  });

export const requestNewsPictureRemoval = (newsPostId: number, accessToken: string): Promise<void> =>
  apiFetch(`${postPath(newsPostId)}/picture`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestNewsPictureFromGallery = async (
  { newsPostId, galleryItemId, crop }: GalleryPickPayload,
  accessToken: string,
): Promise<void> => {
  await apiFetch(`${postPath(newsPostId)}/picture/from-gallery`, {
    method: 'POST',
    body: { galleryItemId, ...toCropBody(crop) },
    schema: PickedNewsPictureSchema,
    accessToken,
  });
};

export const requestGalleryAlbumPhotos = (
  albumId: number,
  accessToken: string,
): Promise<GalleryAlbumPhotos> =>
  apiFetch(`/api/gallery/albums/${albumId}?kind=photo`, {
    schema: GalleryAlbumPhotosSchema,
    accessToken,
  });
