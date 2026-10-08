import type { KkScreenActions } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { LabView } from '../gallery-copy';
import { BIN_TITLE, GALLERY_INBOX_PATH, GALLERY_UPLOAD_PATH, UPLOAD_TITLE } from '../gallery-copy';
import type { HubAlbum, HubSection } from '../gallery-view';
import { hubAlbumOf, hubSectionsOf } from '../gallery-view';
import { LAB_ALBUMS, LAB_INBOX_ALBUM, LAB_SESSIONS } from '../lab-gallery-data';

export interface GalleryHub {
  sections: HubSection[];
  inbox: HubAlbum | null;
  actions: KkScreenActions | undefined;
  openAlbum: (albumId: string, photo?: number) => void;
  openInbox: () => void;
  openUpload: () => void;
}

const buildHub = (): { sections: HubSection[]; inbox: HubAlbum } => ({
  sections: hubSectionsOf(LAB_SESSIONS, LAB_ALBUMS.map(hubAlbumOf)),
  inbox: hubAlbumOf(LAB_INBOX_ALBUM),
});

export const useGalleryHub = (view: LabView): GalleryHub => {
  const navigate = useNavigate();
  const [hub] = useState(buildHub);
  const manages = view === 'manage';

  const openAlbum = (albumId: string, photo?: number): void => {
    void navigate({
      to: '/lab/gallery/$albumId',
      params: { albumId },
      search: { persona: view, photo },
    });
  };
  const openInbox = (): void => {
    void navigate({ to: GALLERY_INBOX_PATH });
  };
  const openUpload = (): void => {
    void navigate({ to: GALLERY_UPLOAD_PATH });
  };
  const noop = (): void => undefined;

  const actions: KkScreenActions | undefined = manages
    ? [
        { id: 'bin', label: BIN_TITLE, icon: 'delete', onSelect: noop },
        { id: 'upload', label: UPLOAD_TITLE, icon: 'upload', onSelect: openUpload, emphasis: true },
      ]
    : undefined;

  return {
    sections: hub.sections,
    inbox: manages ? hub.inbox : null,
    actions,
    openAlbum,
    openInbox,
    openUpload,
  };
};
