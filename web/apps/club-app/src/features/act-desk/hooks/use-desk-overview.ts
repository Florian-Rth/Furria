import { waveformOf } from '@furria/studio/mix-waveform';
import { partRangeOf } from '@furria/studio/music-timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { shareOf } from '../desk-time';
import type { ActDesk } from './use-act-desk';

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

export const useDeskOverview = (desk: ActDesk, centre: CentreScrub): DeskOverviewView => {
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
      centre.centreOn(share * length);
    },
  };
};
