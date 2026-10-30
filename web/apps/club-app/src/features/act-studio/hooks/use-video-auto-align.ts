import { useEffect, useEffectEvent, useRef } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { VideoMutations } from '../api';
import { musicKeyOf, needsAlignment } from '../studio-videos';

const ID_SEPARATOR = ',';

export const useVideoAutoAlign = (
  studio: Studio,
  canEdit: boolean,
  videos: VideoMutations,
): void => {
  const tried = useRef(new Set<string>());
  const music = musicKeyOf(studio);
  const waiting = canEdit
    ? studio.videos
        .filter(needsAlignment)
        .map((video) => video.videoId)
        .join(ID_SEPARATOR)
    : '';

  const align = useEffectEvent((videoId: number): void => {
    videos.autoAlign.mutate(videoId);
  });

  useEffect(() => {
    for (const id of waiting === '' ? [] : waiting.split(ID_SEPARATOR).map(Number)) {
      const attempt = `${id}@${music}`;
      if (!tried.current.has(attempt)) {
        tried.current.add(attempt);
        align(id);
      }
    }
  }, [waiting, music]);
};
