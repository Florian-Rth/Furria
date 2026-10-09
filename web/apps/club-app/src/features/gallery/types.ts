export interface AlbumPayload {
  title: string;
  description: string | null;
  calendarEntryId: number | null;
  sessionStartYear: number | null;
}

export interface AlbumUpdatePayload extends AlbumPayload {
  coverMediaItemId: number | null;
}

export interface SelectionPhoto {
  mediaItemId: number;
  caption: string | null;
}

export type InboxOwner =
  | { kind: 'mine' }
  | { kind: 'uploader'; personId: number }
  | { kind: 'ownerless' };
