import type { KkScreenOrigin } from '@furria/ui';
import { z } from 'zod';

export const GALLERY_TITLE = 'Galerie';
export const GALLERY_PATH = '/lab/gallery';
export const GALLERY_INBOX_PATH = '/lab/gallery/inbox';
export const ALBUM_ROUTE = '/lab/gallery/$albumId';
export const GALLERY_UPLOAD_PATH = '/lab/gallery/upload';
export const GALLERY_ORIGIN: KkScreenOrigin = { label: GALLERY_TITLE, to: GALLERY_PATH };
export const LAB_ORIGIN: KkScreenOrigin = { label: 'Labor', to: '/lab' };

export const GALLERY_LAB_ENTRY = 'Galerie · Kontaktbogen';
export const GALLERY_LAB_META = 'S5-Prototyp: Galerie, Album, Lupe, Hochladen, Eingang';

export const INBOX_TITLE = 'Eingang';
export const BIN_TITLE = 'Papierkorb';
export const SELECTION_TITLE = 'Auswahl';
export const UPLOAD_TITLE = 'Hochladen';
export const FREE_TITLE = 'Ohne Session';
export const SESSION_WORD = 'Session';

export const PUBLISH_LABEL = 'Veröffentlichen';
export const WITHDRAW_LABEL = 'Zurückziehen';
export const PUBLISHED_MARK = 'Veröffentlicht';
export const UNPUBLISHED_MARK = 'Nicht veröffentlicht';
export const NO_SESSION_NOTE = 'Ohne Session nicht veröffentlichbar';
export const ZIP_LABEL = 'ZIP';
export const SELECT_LABEL = 'Auswählen';
export const ORIGINAL_LABEL = 'Original';
export const RAIL_LABEL = 'Zeitleiste des Abends';

export const LabViewSchema = z.enum(['manage', 'member']).catch('manage');
export type LabView = z.infer<typeof LabViewSchema>;

export const GallerySearchSchema = z.object({ persona: LabViewSchema.optional() });

export const AlbumSearchSchema = z.object({
  persona: LabViewSchema.optional(),
  photo: z.coerce.number().int().positive().optional().catch(undefined),
  kind: z.enum(['all', 'photo', 'video']).optional().catch(undefined),
});
export type AlbumSearch = z.infer<typeof AlbumSearchSchema>;

export const UploadSearchSchema = z.object({
  net: z.enum(['on', 'off']).optional().catch(undefined),
});

export const InboxSearchSchema = z.object({
  left: z.coerce.number().int().positive().optional().catch(undefined),
});
