import { waveformOf } from '@/features/act-player/mix-waveform';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { shareOf } from '../desk-time';
import type { ActDesk } from './use-act-desk';
import type { DeskZoom } from './use-desk-zoom';

const OVERVIEW_BARS = 480;

export interface DeskOverviewBand {
  key: string;
  start: number;
  end: number;
  name: string;
  shade: boolean;
  current: boolean;
}

export interface DeskOverviewView {
  bands: DeskOverviewBand[];
  wave: number[];
  aim: (share: number) => void;
}

export const useDeskOverview = (desk: ActDesk, zoom: DeskZoom): DeskOverviewView => {
  const { playback, practice } = desk.screen;
  const { length, parts, steps } = playback;
  const currentId = practice.step?.stepId ?? null;

  return {
    bands: parts.flatMap((part, index) => {
      const range = partRangeOf(part, steps);

      return range === null
        ? []
        : [
            {
              key: String(part.partId),
              start: shareOf(range.start, length),
              end: shareOf(range.end, length),
              name: part.name,
              shade: index % 2 === 1,
              current: currentId !== null && part.stepIds.includes(currentId),
            },
          ];
    }),
    wave: waveformOf(playback.segments, playback.peaksByItem, OVERVIEW_BARS),
    aim: (share) => {
      const seconds = share * length;
      playback.player.seek(seconds);
      zoom.centreOn(seconds);
    },
  };
};
