import type { DocumentSong } from './studio-document';
import { idsOf, itemOf } from './studio-document';

const OVERLAP_TOLERANCE_SECONDS = 1e-6;

const cutsOverlap = (left: DocumentSong, right: DocumentSong): boolean =>
  left.mediaItemId === right.mediaItemId &&
  left.startSeconds < right.endSeconds - OVERLAP_TOLERANCE_SECONDS &&
  right.startSeconds < left.endSeconds - OVERLAP_TOLERANCE_SECONDS;

export const overlapsASiblingIn = (
  songs: Readonly<Record<number, DocumentSong>>,
  songId: number,
  song: DocumentSong,
): boolean =>
  idsOf(songs).some((siblingId) => {
    const sibling = itemOf(songs, siblingId);

    return siblingId !== songId && sibling !== null && cutsOverlap(song, sibling);
  });

export const hasOverlappingCuts = (songs: Readonly<Record<number, DocumentSong>>): boolean =>
  idsOf(songs).some((songId) => {
    const song = itemOf(songs, songId);

    return song !== null && overlapsASiblingIn(songs, songId, song);
  });
