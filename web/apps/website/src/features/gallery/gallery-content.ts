import type { KkPhotoOrientation } from '@furria/ui';
import { toPictureSourceSet } from '@furria/ui';
import type { LinkProps } from '@tanstack/react-router';
import { sessionAt } from '@/lib/club';
import { formatLongDate } from '@/lib/date';
import { buildIdSlug } from '@/lib/id-slug';
import type {
  AlbumDetail,
  AlbumPhoto,
  AlbumSummary,
  GalleryPhoto,
  GallerySection,
  GallerySession,
} from '@/lib/public-gallery/schemas';

export type PhotoOrientation = KkPhotoOrientation;

export const galleryEyebrow = 'BILDER AUS DER SESSION';

export const galleryHeading = 'GALERIE';

export const galleryDescription =
  'Pro Anlass rund ein Dutzend Bilder, mit Absicht ausgesucht: der Saal, die Straße und alles dazwischen — nicht alles, was jemand fotografiert hat.';

export const currentSessionHeading = 'DIESE SESSION';

export const olderSessionsHeading = 'FRÜHERE SESSIONEN';

export const nextAlbumHeading = 'NÄCHSTES ALBUM';

export const albumLinkLabel = 'Album ansehen →';

export const albumBackLinkLabel = '← Alle Alben';

export const albumPhotoCountCaption = 'AUSGEWÄHLTE FOTOS';

export const emptyGalleryTitle = 'NOCH KEIN ALBUM.';

export const emptyGalleryDescription =
  'Die ersten Bilder der Session kommen nach dem nächsten Abend — bis dahin lohnt ein Blick auf die Veranstaltungen.';

export const gallerySourceLabels = {
  loading: 'Die Bilder kommen gleich.',
  errorTitle: 'DIE BILDER KOMMEN NICHT DURCH.',
  errorText:
    'Das liegt an uns, nicht an dir. Versuch es gleich noch einmal — oder schreib uns, dann antwortet ein Mensch.',
  errorRetry: 'Nochmal versuchen',
  askCta: 'Schreib uns',
} as const;

export const albumViewerHint = 'Bild antippen für die große Ansicht';

export const featuredAlbumFlag = 'NEUESTES ALBUM';

export const photoViewerLabels = {
  close: 'Große Ansicht schließen',
  previous: 'Vorheriges Foto',
  next: 'Nächstes Foto',
  counterJoin: 'von',
} as const;

export const rightsNoteCopyright = 'Alle Bilder © Furrscher Carnevals Club e.V.';

export const rightsNoteQuestion = 'Du bist auf einem Foto und möchtest es hier nicht sehen?';

export const rightsNoteHint = 'Eine kurze Mail genügt, dann nehmen wir es raus:';

export interface GalleryEventsBandContent {
  kicker: string;
  headline: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const galleryEventsBandContent: GalleryEventsBandContent = {
  kicker: 'NICHT NUR ZUSCHAUEN',
  headline: 'BEIM NÄCHSTEN MAL SELBST DABEI',
  ctaLabel: 'Zu den Veranstaltungen →',
  ctaTo: '/events',
};

export const albumCoverOrientation: PhotoOrientation = 'landscape';

export const galleryCoverSizes = '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw';

export const featuredCoverSizes = '100vw';

export const photoTileSizes = '(min-width: 900px) 50vw, 100vw';

export const viewerPhotoSizes = '100vw';

export const buildAlbumSlug = (album: { albumId: number; title: string }): string =>
  buildIdSlug(album.albumId, album.title);

export const buildAlbumHref = (album: { albumId: number; title: string }): string =>
  `/gallery/${buildAlbumSlug(album)}`;

export const buildPhotoSourceSet = (photo: GalleryPhoto): string =>
  toPictureSourceSet(photo, photo.aspect);

export const buildSessionLabel = (session: GallerySession): string =>
  session.number === null
    ? `Session ${session.yearsLabel}`
    : `${session.number}. Session ${session.yearsLabel}`;

interface AlbumMoment {
  entryStartsAt: string | null;
  session: GallerySession;
}

export const buildAlbumMeta = (album: AlbumMoment): string =>
  album.entryStartsAt === null
    ? buildSessionLabel(album.session)
    : `${formatLongDate(album.entryStartsAt)} · ${buildSessionLabel(album.session)}`;

export const buildPhotoCountLabel = (count: number): string =>
  count === 1 ? '1 Foto' : `${count} Fotos`;

export const buildAlbumCountLabel = (count: number): string =>
  count === 1 ? '1 Album' : `${count} Alben`;

export const buildFeaturedAlbumMeta = (album: AlbumSummary): string =>
  `${buildAlbumMeta(album)} · ${buildPhotoCountLabel(album.photoCount)}`;

export const buildAlbumRowMeta = (album: AlbumSummary): string =>
  album.entryStartsAt === null
    ? buildPhotoCountLabel(album.photoCount)
    : `${formatLongDate(album.entryStartsAt)} · ${buildPhotoCountLabel(album.photoCount)}`;

export const buildAlbumCoverAlt = (album: AlbumSummary): string =>
  `Titelbild vom Album ${album.title}`;

export const buildAlbumDocumentTitle = (album: AlbumDetail): string =>
  `${album.title} ${album.session.yearsLabel}`;

export const buildAlbumDescription = (album: AlbumDetail): string =>
  album.paragraphs?.[0] ??
  `${buildPhotoCountLabel(album.photos.length)}: ${album.title}, ${buildAlbumMeta(album)}.`;

export const buildPhotoAlt = (albumTitle: string, photo: AlbumPhoto, index: number): string =>
  photo.caption ?? `${albumTitle}, Foto ${index + 1}`;

export const buildPhotoOpenLabel = (alt: string): string => `${alt} — groß ansehen`;

export const buildPhotoCountSuffix = (photoCount: number): string =>
  ` ${photoViewerLabels.counterJoin} ${photoCount}`;

export interface AlbumPhotoEntry {
  photo: AlbumPhoto;
  index: number;
  alt: string;
  sourceSet: string;
}

export const buildAlbumPhotoEntries = (album: AlbumDetail): AlbumPhotoEntry[] =>
  album.photos.map((photo, index) => ({
    photo,
    index,
    alt: buildPhotoAlt(album.title, photo, index),
    sourceSet: buildPhotoSourceSet(photo),
  }));

const listAlbums = (sections: GallerySection[]): AlbumSummary[] =>
  sections.flatMap((section) => section.albums);

export const countPhotos = (albums: AlbumSummary[]): number =>
  albums.reduce((total, album) => total + album.photoCount, 0);

export const selectNextAlbum = (
  sections: GallerySection[],
  currentAlbumId: number,
): AlbumSummary | undefined => {
  const ordered = listAlbums(sections);
  const currentIndex = ordered.findIndex((album) => album.albumId === currentAlbumId);

  if (currentIndex === -1 || ordered.length < 2) {
    return undefined;
  }

  return ordered[(currentIndex + 1) % ordered.length];
};

export interface AlbumSessionGroup {
  session: GallerySession;
  albums: AlbumSummary[];
}

export interface GalleryAlbums {
  featuredAlbum: AlbumSummary | undefined;
  currentSessionAlbums: AlbumSummary[];
  olderSessionGroups: AlbumSessionGroup[];
}

export const selectGalleryAlbums = (sections: GallerySection[], reference: Date): GalleryAlbums => {
  const openStartYear = sessionAt(reference).startYear;
  const featuredAlbum = listAlbums(sections)[0];
  const groups = sections.map((section) => ({
    session: section.session,
    albums: section.albums.filter((album) => album !== featuredAlbum),
  }));

  return {
    featuredAlbum,
    currentSessionAlbums: groups
      .filter((group) => group.session.startYear >= openStartYear)
      .flatMap((group) => group.albums),
    olderSessionGroups: groups.filter(
      (group) => group.session.startYear < openStartYear && group.albums.length > 0,
    ),
  };
};

export const buildOlderSessionSummary = (group: AlbumSessionGroup): string =>
  `${buildAlbumCountLabel(group.albums.length)} · ${buildPhotoCountLabel(countPhotos(group.albums))}`;
