import type { KkPhotoOrientation } from '@furria/ui';
import type { LinkProps } from '@tanstack/react-router';
import type { Session } from '@/lib/club';
import { CLUB_CONTACT_EMAIL, sessionAt } from '@/lib/club';
import { formatLongDate } from '@/lib/date';

export type PhotoOrientation = KkPhotoOrientation;

export interface Photo {
  orientation: PhotoOrientation;
  alt: string;
  source?: string;
}

export interface Album {
  slug: string;
  title: string;
  date: string;
  venue: string;
  intro: string;
  photoCredit: string;
  photos: Photo[];
}

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

export const rightsNoteContactHref = `mailto:${CLUB_CONTACT_EMAIL}`;

export const rightsNoteContactLabel = CLUB_CONTACT_EMAIL;

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

export const ALBUMS: Album[] = [
  {
    slug: 'prunksitzung-2026',
    title: 'Prunksitzung',
    date: '2026-02-14',
    venue: 'Festhalle',
    intro:
      'Vier Stunden Bühne, vierzehn Auftritte, ein Saal bis in die letzte Reihe. Die Technik fiel dreimal aus — gemerkt hat es niemand.',
    photoCredit: 'Wegwerfkamera vom Kiosk',
    photos: [
      { orientation: 'landscape', alt: 'Der Elferrat marschiert in die vollbesetzte Halle ein' },
      { orientation: 'portrait', alt: 'Ansage am Mikrofon, kurz vor dem ersten Auftritt' },
      { orientation: 'landscape', alt: 'Die Tanzgarde in der ersten Formation' },
      { orientation: 'landscape', alt: 'Blick von der Empore über die vollen Tischreihen' },
      { orientation: 'portrait', alt: 'Büttenrede in der elften Minute' },
      { orientation: 'portrait', alt: 'Die Kindergarde wartet hinter dem Vorhang' },
      { orientation: 'landscape', alt: 'Das Männerballett in der Schlusspose' },
      { orientation: 'portrait', alt: 'Ordensverleihung am Bühnenrand' },
      { orientation: 'landscape', alt: 'Schunkeln in Reihe vier' },
      { orientation: 'landscape', alt: 'Showtanz im blauen Bühnenlicht' },
      { orientation: 'portrait', alt: 'Die Technik-Crew hinter dem Mischpult' },
      { orientation: 'landscape', alt: 'Letzter Applaus um 23:40 Uhr' },
    ],
  },
  {
    slug: 'rosenmontagsumzug-2026',
    title: 'Rosenmontagsumzug',
    date: '2026-02-16',
    venue: 'Dorfplatz',
    intro:
      'Der Wagen hat gehalten, das Wetter auch. Elf Bilder vom Zug durch Großfurra, inklusive der Kurve, die zweimal genommen werden musste.',
    photoCredit: 'Kamera, auf dem Wagen festgeklebt',
    photos: [
      { orientation: 'landscape', alt: 'Der Wagen verlässt die Bauhalle' },
      { orientation: 'landscape', alt: 'Aufstellung der Fußgruppen an der Schule' },
      { orientation: 'portrait', alt: 'Kamelle für die erste Reihe' },
      { orientation: 'landscape', alt: 'Die Fußgruppe der Kostümwerkstatt' },
      { orientation: 'landscape', alt: 'Der Musikzug an der Kirche' },
      { orientation: 'landscape', alt: 'Konfetti über der Hauptstraße' },
      { orientation: 'portrait', alt: 'Kinder auf dem Wagen, ganz vorn' },
      { orientation: 'landscape', alt: 'Pause am Marktplatz' },
      { orientation: 'landscape', alt: 'Die Garde tanzt auf offener Straße' },
      { orientation: 'portrait', alt: 'Zieleinlauf am Vereinsheim' },
      { orientation: 'landscape', alt: 'Aufräumen im letzten Licht' },
    ],
  },
  {
    slug: 'kinderfasching-2026',
    title: 'Kinderfasching',
    date: '2026-02-08',
    venue: 'Sporthalle',
    intro:
      'Der Nachmittag der Kleinsten: Kinderprinzenpaar, Polonaise durch den ganzen Saal und eine Zuckerwattemaschine, die um 15 Uhr aufgab.',
    photoCredit: 'Vereinshandy mit acht Prozent Akku',
    photos: [
      { orientation: 'landscape', alt: 'Das Kinderprinzenpaar winkt von der Bühne' },
      { orientation: 'landscape', alt: 'Die Kindergarde in voller Aufstellung' },
      { orientation: 'portrait', alt: 'Erste Reihe, alle Blicke nach vorn' },
      { orientation: 'landscape', alt: 'Sketch der Jugendgruppe' },
      { orientation: 'landscape', alt: 'Polonaise quer durch den Saal' },
      { orientation: 'portrait', alt: 'Warteschlange vor der Zuckerwatte' },
      { orientation: 'portrait', alt: 'Ansage der Kinderpräsidentin am Mikrofon' },
      { orientation: 'landscape', alt: 'Konfetti über den vorderen Tischen' },
      { orientation: 'landscape', alt: 'Abschlussbild aller Gruppen auf der Bühne' },
    ],
  },
  {
    slug: 'sessionseroeffnung-2025',
    title: 'Sessionseröffnung',
    date: '2025-11-11',
    venue: 'Marktplatz und Vereinsheim',
    intro:
      'Punkt 19:11 Uhr wurde die fünfte Jahreszeit geweckt: Fackeln, neues Motto und ein Mikrofon, das erst beim dritten Versuch anging.',
    photoCredit: 'Blitzlicht ohne Bedienungsanleitung',
    photos: [
      { orientation: 'landscape', alt: 'Der Marktplatz um 19:11 Uhr' },
      { orientation: 'portrait', alt: 'Das Motto der Session fällt' },
      { orientation: 'landscape', alt: 'Fackelzug hinauf zum Vereinsheim' },
      { orientation: 'landscape', alt: 'Der Elferrat der neuen Session' },
      { orientation: 'portrait', alt: 'Der erste Tanz des Abends' },
      { orientation: 'landscape', alt: 'Volles Vereinsheim bis in den Flur' },
      { orientation: 'portrait', alt: 'Übergabe der Vereinsfahne' },
      { orientation: 'landscape', alt: 'Letzte Runde kurz vor Mitternacht' },
    ],
  },
  {
    slug: 'rosenmontagsumzug-2025',
    title: 'Rosenmontagsumzug',
    date: '2025-03-03',
    venue: 'Dorfplatz',
    intro:
      'Regen am Morgen, Sonne ab der zweiten Straße: acht Bilder von einem Zug, der trotzdem doppelt so lang wurde wie geplant.',
    photoCredit: 'Zwei Einwegkameras, elf Versuche',
    photos: [
      { orientation: 'landscape', alt: 'Aufstellung im Nebel' },
      { orientation: 'landscape', alt: 'Der Wagen rollt an' },
      { orientation: 'portrait', alt: 'Regenschirme in der ersten Reihe' },
      { orientation: 'landscape', alt: 'Musikzug auf nasser Straße' },
      { orientation: 'landscape', alt: 'Kamelle über die Absperrung' },
      { orientation: 'portrait', alt: 'Fußgruppe in selbstgenähten Kostümen' },
      { orientation: 'landscape', alt: 'Sonne über dem Marktplatz' },
      { orientation: 'landscape', alt: 'Abschluss vor dem Vereinsheim' },
    ],
  },
  {
    slug: 'prunksitzung-2025',
    title: 'Prunksitzung',
    date: '2025-02-22',
    venue: 'Festhalle',
    intro:
      'Zehn Bilder, die ein Jahr lang in einer Keksdose im Vereinsheim lagen und erst beim Aufräumen wieder auftauchten.',
    photoCredit: 'Fotoapparat aus dem Fundus',
    photos: [
      { orientation: 'landscape', alt: 'Einmarsch des Elferrats' },
      { orientation: 'portrait', alt: 'Eröffnung der Sitzung am Pult' },
      { orientation: 'landscape', alt: 'Tanzgarde im Scheinwerferkegel' },
      { orientation: 'landscape', alt: 'Der Saal von der Bühne aus' },
      { orientation: 'portrait', alt: 'Büttenrede mit Zettelwirtschaft' },
      { orientation: 'landscape', alt: 'Showtanz, letzte Hebefigur' },
      { orientation: 'portrait', alt: 'Orden für die Ehrengäste' },
      { orientation: 'landscape', alt: 'Musik am Bühnenrand' },
      { orientation: 'portrait', alt: 'Pause an der Getränkeausgabe' },
      { orientation: 'landscape', alt: 'Finale mit allen Gruppen' },
    ],
  },
];

export const buildAlbumHref = (slug: string): string => `/gallery/${slug}`;

export const findAlbumBySlug = (albums: Album[], slug: string): Album | undefined =>
  albums.find((album) => album.slug === slug);

export const sortAlbumsByDateDesc = (albums: Album[]): Album[] =>
  [...albums].sort((first, second) => second.date.localeCompare(first.date));

const atLocalMidnight = (isoDate: string): Date => new Date(`${isoDate}T00:00`);

export const albumSession = (album: Album): Session => sessionAt(atLocalMidnight(album.date));

export const countPhotos = (albums: Album[]): number =>
  albums.reduce((total, album) => total + album.photos.length, 0);

export const buildPhotoCountLabel = (count: number): string =>
  count === 1 ? '1 Foto' : `${count} Fotos`;

export const buildAlbumMeta = (album: Album): string =>
  `${formatLongDate(album.date)} · ${album.venue}`;

export const buildFeaturedAlbumMeta = (album: Album): string =>
  `${buildAlbumMeta(album)} · ${buildPhotoCountLabel(album.photos.length)}`;

export const selectFeaturedAlbum = (albums: Album[]): Album | undefined =>
  sortAlbumsByDateDesc(albums)[0];

export const excludeAlbum = (albums: Album[], excluded: Album | undefined): Album[] =>
  excluded === undefined ? albums : albums.filter((album) => album.slug !== excluded.slug);

export const selectNextAlbum = (albums: Album[], currentSlug: string): Album | undefined => {
  const ordered = sortAlbumsByDateDesc(albums);
  const currentIndex = ordered.findIndex((album) => album.slug === currentSlug);

  if (currentIndex === -1 || ordered.length < 2) {
    return undefined;
  }

  return ordered[(currentIndex + 1) % ordered.length];
};

export const buildAlbumCreditLabel = (album: Album): string => `Fotos: ${album.photoCredit}`;

export const buildPhotoViewerMetaLabel = (album: Album): string =>
  `${buildAlbumCreditLabel(album)} · ${album.venue}`;

export const buildPhotoOpenLabel = (photo: Photo): string => `${photo.alt} — groß ansehen`;

export const buildPhotoPlaceholderLabel = (album: Album, index: number): string =>
  `${album.slug}-${String(index + 1).padStart(2, '0')}`;

export const buildAlbumDocumentTitle = (album: Album): string =>
  `${album.title} ${albumSession(album).yearsLabel}`;

export const albumCoverOrientation: PhotoOrientation = 'landscape';

export const buildAlbumCoverAlt = (album: Album): string => `Titelbild vom Album ${album.title}`;

export const buildAlbumCoverSource = (album: Album): string | undefined => album.photos[0]?.source;

export const selectCurrentSessionAlbums = (albums: Album[], reference: Date): Album[] => {
  const openSession = sessionAt(reference);

  return sortAlbumsByDateDesc(albums).filter(
    (album) => albumSession(album).startYear === openSession.startYear,
  );
};

export interface AlbumSessionGroup {
  session: Session;
  albums: Album[];
}

export const selectOlderSessionGroups = (albums: Album[], reference: Date): AlbumSessionGroup[] => {
  const openSession = sessionAt(reference);
  const groups = new Map<number, AlbumSessionGroup>();

  for (const album of sortAlbumsByDateDesc(albums)) {
    const session = albumSession(album);
    if (session.startYear >= openSession.startYear) {
      continue;
    }

    const group = groups.get(session.startYear);
    if (group === undefined) {
      groups.set(session.startYear, { session, albums: [album] });
    } else {
      group.albums.push(album);
    }
  }

  return [...groups.values()].sort(
    (first, second) => second.session.startYear - first.session.startYear,
  );
};

export const buildAlbumCountLabel = (count: number): string =>
  count === 1 ? '1 Album' : `${count} Alben`;

export const buildOlderSessionSummary = (group: AlbumSessionGroup): string =>
  `${buildAlbumCountLabel(group.albums.length)} · ${buildPhotoCountLabel(countPhotos(group.albums))}`;

export const buildAlbumRowMeta = (album: Album): string =>
  `${formatLongDate(album.date)} · ${buildPhotoCountLabel(album.photos.length)}`;

export const buildPhotoCountSuffix = (photoCount: number): string =>
  ` ${photoViewerLabels.counterJoin} ${photoCount}`;

export interface AlbumPhotoEntry {
  photo: Photo;
  index: number;
  placeholderLabel: string;
}

export const buildAlbumPhotoEntries = (album: Album): AlbumPhotoEntry[] =>
  album.photos.map((photo, index) => ({
    photo,
    index,
    placeholderLabel: buildPhotoPlaceholderLabel(album, index),
  }));
