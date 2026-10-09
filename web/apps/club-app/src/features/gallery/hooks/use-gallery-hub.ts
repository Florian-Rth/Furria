import type { KkScreenActions, KkScreenThread } from '@furria/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useGalleryHubQuery, useInboxesQuery } from '../api';
import {
  ALBUM_NEW_PATH,
  ALBUM_ROUTE,
  BIN_TITLE,
  GALLERY_BIN_PATH,
  GALLERY_INBOX_PATH,
  GALLERY_UPLOAD_PATH,
  UPLOAD_TITLE,
} from '../gallery-copy';
import { ownInboxFirst } from '../hub-view';
import type { GalleryHub, InboxSummary } from '../schemas';
import type { InboxOwner } from '../types';
import { useGalleryUploadThread } from './use-gallery-upload-thread';

export interface GalleryHubState {
  hub: UseQueryResult<GalleryHub, Error>;
  inboxes: InboxSummary[];
  sorts: boolean;
  showsSelection: boolean;
  actions: KkScreenActions | undefined;
  thread: KkScreenThread | undefined;
  now: Date;
  openAlbum: (albumId: number, photo?: number) => void;
  openInbox: (owner: InboxOwner) => void;
  openNewAlbum: () => void;
  openUpload: () => void;
}

const inboxSearchOf = (owner: InboxOwner): { uploader?: number; ownerless?: boolean } => {
  switch (owner.kind) {
    case 'mine':
      return {};
    case 'uploader':
      return { uploader: owner.personId };
    case 'ownerless':
      return { ownerless: true };
  }
};

export const useGalleryHub = (): GalleryHubState => {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const me = useMeQuery();
  const hub = useGalleryHubQuery();
  const thread = useGalleryUploadThread();
  const manages = has(PERMISSION_KEYS.galleryManage);
  const sorts = manages || has(PERMISSION_KEYS.galleryUpload);
  const inboxQuery = useInboxesQuery(sorts);
  const inboxes = ownInboxFirst(inboxQuery.data?.inboxes ?? [], me.data?.person?.id ?? null);

  const openAlbum = (albumId: number, photo?: number): void => {
    void navigate({ to: ALBUM_ROUTE, params: { albumId: String(albumId) }, search: { photo } });
  };
  const openInbox = (owner: InboxOwner): void => {
    void navigate({ to: GALLERY_INBOX_PATH, search: inboxSearchOf(owner) });
  };
  const openNewAlbum = (): void => {
    void navigate({ to: ALBUM_NEW_PATH, search: {} });
  };
  const openUpload = (): void => {
    void navigate({ to: GALLERY_UPLOAD_PATH, search: {} });
  };
  const openBin = (): void => {
    void navigate({ to: GALLERY_BIN_PATH });
  };

  const upload = {
    id: 'upload',
    label: UPLOAD_TITLE,
    icon: 'upload',
    onSelect: openUpload,
    emphasis: true,
  } as const;
  const bin = { id: 'bin', label: BIN_TITLE, icon: 'delete', onSelect: openBin } as const;
  const sorterActions: KkScreenActions = manages ? [bin, upload] : [upload];

  return {
    hub,
    inboxes,
    sorts,
    showsSelection: has(PERMISSION_KEYS.galleryPublish),
    actions: sorts ? sorterActions : undefined,
    thread,
    now: new Date(),
    openAlbum,
    openInbox,
    openNewAlbum,
    openUpload,
  };
};
