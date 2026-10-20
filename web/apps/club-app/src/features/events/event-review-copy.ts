import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';

export const toAlbumsCountNote = (count: number): string => {
  if (count === 0) {
    return 'Noch kein Album zu diesem Abend veröffentlicht.';
  }

  return count === 1
    ? '1 Album zu diesem Abend ist veröffentlicht.'
    : `${count} Alben zu diesem Abend sind veröffentlicht.`;
};

export const toNewsCountNote = (count: number): string => {
  if (count === 0) {
    return 'Noch keine Meldung zu diesem Abend veröffentlicht. Verknüpfe sie beim Schreiben mit dem Abend.';
  }

  return count === 1
    ? '1 Meldung zu diesem Abend ist veröffentlicht.'
    : `${count} Meldungen zu diesem Abend sind veröffentlicht.`;
};

export interface ReviewAlbumFacts {
  photos: number;
  videos: number;
  publishedAt: string | null;
}

export interface AlbumRowCopy {
  span: string;
  spanLabel: string;
  meta: string;
}

export const toAlbumRowCopy = ({ photos, videos, publishedAt }: ReviewAlbumFacts): AlbumRowCopy => {
  const state =
    publishedAt === null
      ? 'nicht veröffentlicht'
      : `auf der Website seit ${formatIsoDay(toIsoDay(new Date(publishedAt)))}`;
  const videoPart = videos === 0 ? null : videos === 1 ? '1 Video' : `${videos} Videos`;

  return {
    span: String(photos),
    spanLabel: photos === 1 ? 'Foto' : 'Fotos',
    meta: videoPart === null ? state : `${state} · ${videoPart}`,
  };
};
