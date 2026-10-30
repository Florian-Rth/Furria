import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio, StudioStage } from '@/features/acts/schemas';
import {
  STUDIO_I_FINAL,
  STUDIO_I_FINAL_NONE,
  STUDIO_I_FINAL_NOTE,
  STUDIO_I_FREE,
  STUDIO_I_MUSIC_PAGE,
  STUDIO_I_SONGS,
  STUDIO_I_SPOTS,
  STUDIO_I_STAGE,
  songCutOf,
  songMetaOf,
  songsMetaOf,
  spotsMetaOf,
  stageMetaOf,
} from '../studio-i-copy';
import { songNameOf, songsInOrder } from '../studio-i-songs';

export interface OverviewSongView {
  key: string;
  number: number;
  name: string;
  meta: string;
  cut: string;
  from: number;
  to: number;
}

export interface OverviewSpotView {
  key: string;
  number: number;
  name: string;
  open: boolean;
}

export interface StudioIOverviewView {
  label: string;
  songsTitle: string;
  songsMeta: string;
  songs: OverviewSongView[];
  spotsTitle: string;
  spotsMeta: string;
  spots: OverviewSpotView[];
  stageTitle: string;
  stageMeta: string;
  stage: StudioStage;
  finalTitle: string;
  finalMeta: string;
  finalNote: string;
}

const shareOf = (seconds: number, duration: number | null): number =>
  duration === null || duration <= 0 ? 0 : Math.min(1, Math.max(0, seconds / duration));

export const useStudioIOverview = (
  studio: Studio,
  playback: StudioPlayback,
): StudioIOverviewView => {
  const spots = [...studio.spots].sort((left, right) => left.number - right.number);
  const taken = spots.filter((spot) => spot.person !== null).length;
  const finals = studio.finalTracks.length;

  return {
    label: STUDIO_I_MUSIC_PAGE,
    songsTitle: STUDIO_I_SONGS,
    songsMeta: songsMetaOf(playback.length),
    songs: songsInOrder(studio).map((song, index) => ({
      key: String(song.songId),
      number: index + 1,
      name: songNameOf(song),
      meta: songMetaOf(song.tempoBpm, song.firstBeatSeconds),
      cut: songCutOf(song.startSeconds, song.endSeconds, song.durationSeconds),
      from: song.durationSeconds === null ? 0 : shareOf(song.startSeconds, song.durationSeconds),
      to: song.durationSeconds === null ? 1 : shareOf(song.endSeconds, song.durationSeconds),
    })),
    spotsTitle: STUDIO_I_SPOTS,
    spotsMeta: spotsMetaOf(taken, spots.length),
    spots: spots.map((spot) => ({
      key: String(spot.spotId),
      number: spot.number,
      name: spot.person === null ? STUDIO_I_FREE : spot.person.firstName,
      open: spot.person === null,
    })),
    stageTitle: STUDIO_I_STAGE,
    stageMeta: stageMetaOf(playback.stage.widthMetres, playback.stage.depthMetres),
    stage: playback.stage,
    finalTitle: STUDIO_I_FINAL,
    finalMeta: finals === 0 ? STUDIO_I_FINAL_NONE : `${finals}`,
    finalNote: STUDIO_I_FINAL_NOTE,
  };
};
