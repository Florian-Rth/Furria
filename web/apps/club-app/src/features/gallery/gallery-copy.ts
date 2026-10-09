import { z } from 'zod';

export const ALBUM_ROUTE = '/gallery/$albumId';
export const ALBUM_EDIT_ROUTE = '/gallery/$albumId/edit';
export const ALBUM_SELECTION_ROUTE = '/gallery/$albumId/selection';
export const ALBUM_NEW_PATH = '/gallery/new';
export const GALLERY_INBOX_PATH = '/gallery/inbox';
export const GALLERY_UPLOAD_PATH = '/gallery/upload';
export const GALLERY_BIN_PATH = '/gallery/bin';

export const INBOX_TITLE = 'Eingang';
export const BIN_TITLE = 'Papierkorb';
export const SELECTION_TITLE = 'Auswahl';
export const UPLOAD_TITLE = 'Hochladen';
export const NEW_ALBUM_TITLE = 'Neues Album';
export const EDIT_ALBUM_TITLE = 'Album bearbeiten';
export const FREE_TITLE = 'Ohne Session';
export const SESSION_WORD = 'Session';

export const AlbumKindFilterSchema = z.enum(['photo', 'video']);
export type AlbumKindFilter = z.infer<typeof AlbumKindFilterSchema>;

export const AlbumSearchSchema = z.object({
  photo: z.coerce.number().int().positive().optional().catch(undefined),
  kind: AlbumKindFilterSchema.optional().catch(undefined),
  uploader: z.coerce.number().int().positive().optional().catch(undefined),
});
export type AlbumSearch = z.infer<typeof AlbumSearchSchema>;

export const InboxSearchSchema = z.object({
  uploader: z.coerce.number().int().positive().optional().catch(undefined),
  ownerless: z.boolean().optional().catch(undefined),
});
export type InboxSearch = z.infer<typeof InboxSearchSchema>;

export const UploadSearchSchema = z.object({
  album: z.coerce.number().int().positive().optional().catch(undefined),
});
export type UploadSearch = z.infer<typeof UploadSearchSchema>;

export const AlbumNewSearchSchema = z.object({
  entry: z.coerce.number().int().positive().optional().catch(undefined),
});
export type AlbumNewSearch = z.infer<typeof AlbumNewSearchSchema>;
