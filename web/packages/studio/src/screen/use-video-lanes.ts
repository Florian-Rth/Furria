import type { CentreTarget } from '@furria/studio/centre-targets';
import { partBlockLabelOf, stepsAmountOf, videoBlockLabelOf } from '@furria/studio/desk-copy';
import { rulerTicksOf } from '@furria/studio/desk-time';
import { partRangeOf } from '@furria/studio/music-timeline';
import { stepNumberOf } from '@furria/studio/step-names';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { TimelineBlock, TimelineMark } from '@furria/studio/Timeline';
import type { ActStudioTakes, ActStudioVideoBar } from '@furria/studio/use-act-studio-takes';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';

export const VIDEO_LANE = {
  ruler: 'ruler',
  parts: 'parts',
  music: 'music',
  video: 'video',
} as const;

interface VideoLaneTarget extends CentreTarget {
  move?: (seconds: number) => void;
  end?: () => void;
  tap: () => void;
}

export interface VideoLanes {
  centre: CentreScrub;
  ruler: TimelineMark[];
  parts: TimelineBlock[];
  videos: TimelineBlock[];
  readout: WaveReadout | null;
}

const selectedLast = (bars: readonly ActStudioVideoBar[]): ActStudioVideoBar[] => [
  ...bars.filter((bar) => !bar.selected),
  ...bars.filter((bar) => bar.selected),
];

export const useVideoLanes = (screen: StudioScreen, takes: ActStudioTakes): VideoLanes => {
  const { playback, practice } = screen;
  const { player, length, parts, steps, countMarks, segments } = playback;
  const movable = screen.evening === null;
  const currentId = practice.step?.stepId ?? null;
  const numberOf = (stepId: number): number => stepNumberOf(steps, stepId);

  const partBlocks: TimelineBlock[] = parts.flatMap((part) => {
    const range = partRangeOf(part, steps);
    if (range === null) {
      return [];
    }

    return [
      {
        key: `part-${part.partId}`,
        range,
        lead: null,
        title: part.name,
        meta: stepsAmountOf(part.stepIds.length),
        selected: false,
        current: currentId !== null && part.stepIds.includes(currentId),
        label: partBlockLabelOf(
          part.name,
          numberOf(part.stepIds[0] ?? -1),
          numberOf(part.stepIds.at(-1) ?? -1),
        ),
        onPress: () => {
          player.seek(range.start);
        },
      },
    ];
  });

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
    ...partBlocks.map((block) => ({
      key: block.key,
      seconds: block.range.start,
      until: block.range.end,
      lane: VIDEO_LANE.parts,
      movable: false,
      tappable: true,
      tap: block.onPress,
    })),
    ...bars.map((bar) => ({
      key: `video-${bar.key}`,
      seconds: bar.startSeconds,
      until: bar.endSeconds,
      lane: VIDEO_LANE.video,
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
    ruler: rulerTicksOf(length, centre.pxPerSecond),
    parts: partBlocks,
    videos: videoBlocks,
    readout: waveReadoutOf(centre.readout, segments),
  };
};
