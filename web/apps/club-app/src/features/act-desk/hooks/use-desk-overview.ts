import { bracketTextOf } from '@furria/studio/desk-copy';
import { partRangeOf } from '@furria/studio/music-timeline';
import type { TimelinePart } from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import type { OverviewBracket } from '@furria/studio/use-overview-bracket';
import { useOverviewBracket } from '@furria/studio/use-overview-bracket';
import type { ActDesk } from './use-act-desk';

export interface DeskOverviewView {
  parts: TimelinePart[];
  bracket: OverviewBracket;
  bracketText: string;
}

export const useDeskOverview = (desk: ActDesk, centre: CentreScrub): DeskOverviewView => {
  const { playback, practice } = desk.screen;
  const { length, parts, steps } = playback;
  const currentId = practice.step?.stepId ?? null;
  const bracket = useOverviewBracket(centre, length);

  return {
    parts: parts.map((part, index) => ({
      key: part.partId,
      label: part.name,
      range: partRangeOf(part, steps),
      shade: index,
      current: currentId !== null && part.stepIds.includes(currentId),
    })),
    bracket,
    bracketText: bracketTextOf(Math.max(0, bracket.view.start), Math.min(length, bracket.view.end)),
  };
};
