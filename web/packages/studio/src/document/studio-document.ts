import type { Keyframe, SongPiece, StudioPerson } from '../models/studio-schemas';

export interface DocumentSong {
  pieces: SongPiece[];
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

export interface DocumentStep {
  startSeconds: number | null;
  name: string;
  description: string | null;
}

export interface DocumentPart {
  name: string;
  firstStepId: number | null;
  mainVideoId: number | null;
}

export interface DocumentSpot {
  person: StudioPerson | null;
}

export interface DocumentVideo {
  name: string | null;
  startSeconds: number | null;
  clipStartSeconds: number;
  clipEndSeconds: number | null;
}

export interface DocumentAlignment {
  fromSeconds: number;
  offsetSeconds: number;
  stretch: number;
}

export interface DocumentFinalTrack {
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
  alignments: Record<number, DocumentAlignment[]>;
}

export interface StudioDocument {
  songOrder: number[];
  songs: Record<number, DocumentSong>;
  steps: Record<number, DocumentStep>;
  parts: Record<number, DocumentPart>;
  spotOrder: number[];
  spots: Record<number, DocumentSpot>;
  tracks: Record<number, Keyframe[]>;
  videos: Record<number, DocumentVideo>;
  finalTracks: Record<number, DocumentFinalTrack>;
}

export type DocumentCollection =
  | 'songs'
  | 'steps'
  | 'parts'
  | 'spots'
  | 'tracks'
  | 'videos'
  | 'finalTracks';

export const idsOf = <TItem>(collection: Readonly<Record<number, TItem>>): number[] =>
  Object.keys(collection).map(Number);

export const itemOf = <TItem>(
  collection: Readonly<Record<number, TItem>>,
  id: number,
): TItem | null => (Object.hasOwn(collection, id) ? (collection[id] ?? null) : null);
