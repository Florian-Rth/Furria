import { useKkSheet } from '@furria/ui';
import { useNewsTieCandidatesQuery } from '../api';
import { TIE_ALBUM_SHEET_ID, TIE_CANCELLED, TIE_EVENT_SHEET_ID, TIE_PHOTOS } from '../editor-copy';
import type { NewsAlbumTie, NewsEventTie, TieableAlbum } from '../schemas';
import type { EventTieLines } from '../tie-lines';
import { albumTieLineOf, eventTieLinesOf } from '../tie-lines';
import type { NewsFields, NewsVersion } from '../types';

export interface NewsTies {
  event: NewsEventTie | null;
  album: NewsAlbumTie | null;
  eventLines: EventTieLines | null;
  albumLine: string | null;
  eventChoices: readonly NewsEventTie[];
  albumChoices: readonly TieableAlbum[];
  chooseEvent: () => void;
  chooseAlbum: () => void;
  tieEvent: (eventId: number) => void;
  tieAlbum: (albumId: number) => void;
  releaseEvent: () => void;
  releaseAlbum: () => void;
}

const albumTieOf = (album: TieableAlbum): NewsAlbumTie => ({
  albumId: album.albumId,
  title: album.title,
  isPublished: true,
  photoCount: album.photoCount,
  cover: album.cover,
});

const tiedEventOf = (
  eventId: number | null,
  known: NewsEventTie | null,
  choices: readonly NewsEventTie[],
): NewsEventTie | null => {
  if (eventId === null) {
    return null;
  }
  if (known !== null && known.eventId === eventId) {
    return known;
  }
  return choices.find((choice) => choice.eventId === eventId) ?? null;
};

const tiedAlbumOf = (
  albumId: number | null,
  known: NewsAlbumTie | null,
  choices: readonly TieableAlbum[],
): NewsAlbumTie | null => {
  if (albumId === null) {
    return null;
  }
  if (known !== null && known.albumId === albumId) {
    return known;
  }
  const chosen = choices.find((choice) => choice.albumId === albumId);
  return chosen === undefined ? null : albumTieOf(chosen);
};

export const useNewsTies = (
  version: NewsVersion,
  update: (patch: Partial<NewsFields>) => void,
): NewsTies => {
  const sheet = useKkSheet();
  const candidates = useNewsTieCandidatesQuery(true);
  const eventChoices = candidates.data?.events ?? [];
  const albumChoices = candidates.data?.albums ?? [];
  const event = tiedEventOf(version.eventId, version.event, eventChoices);
  const album = tiedAlbumOf(version.albumId, version.album, albumChoices);

  return {
    event,
    album,
    eventLines: event === null ? null : eventTieLinesOf(event, TIE_CANCELLED, new Date()),
    albumLine: album === null ? null : albumTieLineOf(album.photoCount, TIE_PHOTOS),
    eventChoices,
    albumChoices,
    chooseEvent: () => {
      sheet.open(TIE_EVENT_SHEET_ID);
    },
    chooseAlbum: () => {
      sheet.open(TIE_ALBUM_SHEET_ID);
    },
    tieEvent: (eventId) => {
      sheet.close();
      update({ eventId });
    },
    tieAlbum: (albumId) => {
      sheet.close();
      update({ albumId });
    },
    releaseEvent: () => {
      update({ eventId: null });
    },
    releaseAlbum: () => {
      update({ albumId: null });
    },
  };
};
