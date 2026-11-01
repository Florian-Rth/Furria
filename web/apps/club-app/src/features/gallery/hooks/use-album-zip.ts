import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { useState } from 'react';
import {
  ZIP_FACT_ALBUM,
  ZIP_FACT_CONTENT,
  ZIP_FACT_SIZE,
  ZIP_FACT_TARGET,
  zipSizeLabel,
} from '../album-zip-copy';
import { useFullAlbumFetch } from '../api';
import { downloadReplacesLine, saveTargetLabel } from '../download/download-copy';
import { startDownload, zipSaveRoute } from '../download/download-store';
import { zipFileNameOf } from '../download/media-download';
import { useDownload } from '../download/use-download';
import { countsLine } from '../gallery-view';
import type { AlbumDetails } from '../schemas';

export interface AlbumZip {
  open: boolean;
  facts: KkConfirmFact[];
  replaces: string | null;
  ask: () => void;
  close: () => void;
  confirm: () => void;
}

const factsOf = (album: AlbumDetails): KkConfirmFact[] => [
  { label: ZIP_FACT_ALBUM, value: album.title },
  { label: ZIP_FACT_CONTENT, value: countsLine(album) },
  { label: ZIP_FACT_SIZE, value: zipSizeLabel(album.zipBytes) },
  { label: ZIP_FACT_TARGET, value: saveTargetLabel(zipSaveRoute()) },
];

export const useAlbumZip = (album: AlbumDetails | undefined): AlbumZip => {
  const [open, setOpen] = useState(false);
  const job = useDownload();
  const fetchFullAlbum = useFullAlbumFetch();
  const shown = open && album !== undefined;

  const confirm = (): void => {
    if (album === undefined) {
      return;
    }
    const { albumId } = album;
    startDownload({
      kind: 'album',
      title: album.title,
      fileName: zipFileNameOf(album.title),
      expectedBytes: album.zipBytes,
      url: album.zipUrl,
      refreshUrl: async () => (await fetchFullAlbum(albumId)).zipUrl,
    });
    setOpen(false);
  };

  return {
    open: shown,
    facts: open && album !== undefined ? factsOf(album) : [],
    replaces: job?.phase === 'running' ? downloadReplacesLine(job.request.title) : null,
    ask: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    confirm,
  };
};
