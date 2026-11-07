import type { CentreTarget } from '@furria/studio/centre-targets';
import { videoBlockLabelOf } from '@furria/studio/desk-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';
import type { TimelineBlock, TimelinePart } from '@furria/studio/Timeline';
import { timelineRowsOf } from '@furria/studio/timeline-rows';
import type { ActStudioTakes, ActStudioVideoBar } from '@furria/studio/use-act-studio-takes';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';

interface VideoLaneTarget extends CentreTarget {
  move?: (seconds: number) => void;
  end?: () => void;
  tap: () => void;
}

export interface VideoLanes {
  centre: CentreScrub;
  parts: TimelinePart[];
  videos: TimelineBlock[];
  readout: WaveReadout | null;
}

const selectedLast = (bars: readonly ActStudioVideoBar[]): ActStudioVideoBar[] => [
  ...bars.filter((bar) => !bar.selected),
  ...bars.filter((bar) => bar.selected),
];

export const useVideoLanes = (screen: StudioScreen, takes: ActStudioTakes): VideoLanes => {
  const { playback, practice } = screen;
  const { player, length, countMarks, segments, paths } = playback;
  const movable = screen.evening === null;
  const { parts } = timelineRowsOf(screen.studio, paths, countMarks, practice.step?.stepId ?? null);

  const bars = selectedLast(takes.bars);
  const videoBlocks: TimelineBlock[] = bars.map((bar) => ({
    key: `video-${bar.key}`,
    range: { start: bar.startSeconds, end: bar.endSeconds },
    lead: null,
    title: bar.title,
    meta: bar.meta,
    selected: bar.selected,
    current: false,
    label: videoBlockLabelOf(bar.title),
    onPress: bar.choose,
  }));

  const targets: VideoLaneTarget[] = [
    ...parts.flatMap(({ key, range }) =>
      range === null
        ? []
        : [
            {
              key: `part-${key}`,
              seconds: range.start,
              until: range.end,
              lane: TIMELINE_LANE.parts,
              movable: false,
              tappable: true,
              tap: () => {
                player.seek(range.start);
              },
            },
          ],
    ),
    ...bars.map((bar) => ({
      key: `video-${bar.key}`,
      seconds: bar.startSeconds,
      until: bar.endSeconds,
      lane: TIMELINE_LANE.videos,
      movable,
      tappable: true,
      snaps: false,
      move: bar.moveTo,
      end: bar.finish,
      tap: bar.choose,
    })),
  ];
  const targetOf = (key: string): VideoLaneTarget | undefined =>
    targets.find((target) => target.key === key);

  const centre = useCentreScrub({
    player,
    length,
    countMarks,
    targets,
    onTargetMove: (key, seconds) => {
      targetOf(key)?.move?.(seconds);
    },
    onTargetEnd: (key) => {
      targetOf(key)?.end?.();
    },
    onTargetCancel: (key) => {
      targetOf(key)?.end?.();
    },
    onTargetTap: (key) => {
      targetOf(key)?.tap();
    },
  });

  return {
    centre,
    parts,
    videos: videoBlocks,
    readout: waveReadoutOf(centre.readout, segments),
  };
};
