import type { CentreTarget } from '@furria/studio/centre-targets';
import { countsBetweenOf } from '@furria/studio/count-marks';
import {
  clockOf,
  countShapeOf,
  keyLabelOf,
  partBlockLabelOf,
  spotsAmountOf,
  stepBlockLabelOf,
  stepsAmountOf,
  videoBlockLabelOf,
} from '@furria/studio/desk-copy';
import { KEY_MATCH_SECONDS, keyedSpotsAt, keyTimesOf } from '@furria/studio/desk-keyframes';
import { musicTicksOf, rulerTicksOf } from '@furria/studio/desk-time';
import { formatReadoutTime } from '@furria/studio/drag-readout';
import { countAt, partRangeOf } from '@furria/studio/music-timeline';
import { videoNameOf, waveReadoutDetailOf } from '@furria/studio/studio-copy';
import type {
  TimelineBlock,
  TimelineDiamond,
  TimelineHandle,
  TimelineMark,
} from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import type { WaveReadout } from '@/features/act-studio/hooks/use-act-studio-wave';
import type { ActDesk } from './use-act-desk';
import type { DeskBorders } from './use-desk-borders';
import { useDeskKeyDrag } from './use-desk-key-drag';

export const DESK_LANE = {
  ruler: 'ruler',
  parts: 'parts',
  steps: 'steps',
  music: 'music',
  video: 'video',
  keys: 'keys',
} as const;

interface DeskTarget extends CentreTarget {
  start?: () => void;
  move?: (seconds: number) => void;
  end?: (seconds: number) => void;
  cancel?: () => void;
  tap?: () => void;
}

export interface DeskLaneRows {
  centre: CentreScrub;
  ruler: TimelineMark[];
  beats: TimelineMark[];
  parts: TimelineBlock[];
  steps: TimelineBlock[];
  videos: TimelineBlock[];
  keys: TimelineDiamond[];
  keysAside: string | null;
  borders: TimelineHandle[];
  readout: WaveReadout | null;
}

const isNear = (left: number | null, right: number): boolean =>
  left !== null && Math.abs(left - right) <= KEY_MATCH_SECONDS;

const blockTargetOf = (block: TimelineBlock, lane: string): DeskTarget => ({
  key: block.key,
  seconds: block.range.start,
  until: block.range.end,
  lane,
  movable: false,
  tappable: true,
  tap: block.onPress,
});

export const useDeskLanes = (desk: ActDesk, borders: DeskBorders): DeskLaneRows => {
  const { screen, editor, takes, focus, partId, keySeconds } = desk;
  const { playback, practice, studio } = screen;
  const { length, steps, parts, countMarks, paths, segments } = playback;
  const movable = screen.evening === null;
  const currentId = practice.step?.stepId ?? null;
  const chosen = paths.filter((path) => editor.selected.includes(path.spotId));
  const shownPaths = chosen.length > 0 ? chosen : paths;
  const keyDrag = useDeskKeyDrag(desk, shownPaths);
  const numberOf = (stepId: number): number =>
    steps.findIndex((step) => step.stepId === stepId) + 1;

  const partBlocks: TimelineBlock[] = parts.flatMap((part) => {
    const range = partRangeOf(part, steps);
    if (range === null) {
      return [];
    }
    const first = numberOf(part.stepIds[0] ?? -1);
    const last = numberOf(part.stepIds.at(-1) ?? -1);

    return [
      {
        key: `part-${part.partId}`,
        range,
        lead: null,
        title: part.name,
        meta: stepsAmountOf(part.stepIds.length),
        selected: focus === 'part' && partId === part.partId,
        current: currentId !== null && part.stepIds.includes(currentId),
        label: partBlockLabelOf(part.name, first, last),
        onPress: () => {
          desk.focusPart(part.partId);
        },
      },
    ];
  });

  const stepBlocks: TimelineBlock[] = steps.flatMap((step, index) => {
    if (step.startSeconds === null || step.endSeconds === null) {
      return [];
    }
    const current = step.stepId === currentId;
    const counts = countsBetweenOf(countMarks, step.startSeconds, step.endSeconds);

    return [
      {
        key: `step-${step.stepId}`,
        range: { start: step.startSeconds, end: step.endSeconds },
        lead: String(index + 1),
        title: step.name,
        meta: counts > 0 ? countShapeOf(counts) : null,
        selected: focus === 'step' && current,
        current,
        label: stepBlockLabelOf(index + 1, step.name, current),
        onPress: () => {
          desk.focusStep(step.stepId);
        },
      },
    ];
  });

  const videoTargets: DeskTarget[] = takes.bars.map((bar) => {
    const video = studio.videos.find((candidate) => String(candidate.videoId) === bar.key);
    const start = video?.startSeconds ?? bar.start * length;
    const duration = video?.durationSeconds ?? (bar.end - bar.start) * length;

    return {
      key: `video-${bar.key}`,
      seconds: start,
      until: start + duration,
      lane: DESK_LANE.video,
      movable,
      tappable: true,
      snaps: false,
      start: desk.focusVideo,
      move: bar.moveTo,
      end: bar.finish,
      cancel: bar.finish,
      tap: () => {
        bar.choose();
        desk.focusVideo();
      },
    };
  });

  const videoBlocks: TimelineBlock[] = takes.bars.map((bar, index) => {
    const video = studio.videos.find((candidate) => String(candidate.videoId) === bar.key);
    const number = video === undefined ? 0 : studio.videos.indexOf(video) + 1;
    const name = videoNameOf(video?.name ?? null, number);
    const duration = video?.durationSeconds ?? null;
    const target = videoTargets[index];

    return {
      key: `video-${bar.key}`,
      range: { start: target?.seconds ?? 0, end: target?.until ?? 0 },
      lead: null,
      title: name,
      meta: duration === null ? null : clockOf(duration),
      selected: focus === 'video' && bar.selected,
      current: false,
      label: videoBlockLabelOf(name),
      onPress: () => {
        target?.tap?.();
      },
    };
  });

  const keyTimes = keyTimesOf(shownPaths);
  const keyDiamonds: TimelineDiamond[] = keyTimes.map((seconds, index) => ({
    key: `key-${index}`,
    seconds,
    selected: focus === 'key' && isNear(keyDrag.heldAt ?? keySeconds, seconds),
    dimmed: chosen.length === 0,
    label: keyLabelOf(seconds, keyedSpotsAt(shownPaths, seconds)),
    onPress: () => {
      desk.focusKey(seconds);
    },
    onNudge: (direction: -1 | 1) => {
      keyDrag.nudge(seconds, direction);
    },
  }));
  const keyTargets: DeskTarget[] = keyTimes.map((seconds, index) => ({
    key: `key-${index}`,
    seconds,
    lane: DESK_LANE.keys,
    tappable: true,
    start: () => {
      keyDrag.grab(seconds);
    },
    move: keyDrag.move,
    end: keyDrag.drop,
    cancel: keyDrag.cancel,
    tap: () => {
      desk.focusKey(seconds);
    },
  }));

  const borderTargets: DeskTarget[] = borders.borders.map((border) => ({
    key: border.key,
    seconds: border.seconds,
    lane: DESK_LANE.steps,
    move: border.move,
    end: border.end,
    cancel: border.end,
  }));

  const targets: DeskTarget[] = [
    ...partBlocks.map((block) => blockTargetOf(block, DESK_LANE.parts)),
    ...stepBlocks.map((block) => blockTargetOf(block, DESK_LANE.steps)),
    ...borderTargets,
    ...videoTargets,
    ...keyTargets,
  ];
  const targetOf = (key: string): DeskTarget | undefined =>
    targets.find((target) => target.key === key);

  const centre = useCentreScrub({
    player: playback.player,
    length,
    countMarks,
    targets,
    onTargetStart: (key) => {
      targetOf(key)?.start?.();
    },
    onTargetMove: (key, seconds) => {
      targetOf(key)?.move?.(seconds);
    },
    onTargetEnd: (key, seconds) => {
      targetOf(key)?.end?.(seconds);
    },
    onTargetCancel: (key) => {
      targetOf(key)?.cancel?.();
    },
    onTargetTap: (key) => {
      targetOf(key)?.tap?.();
    },
  });
  const lifted = centre.readout;

  return {
    centre,
    ruler: rulerTicksOf(length, centre.pxPerSecond),
    beats: musicTicksOf(countMarks, centre.pxPerSecond),
    parts: partBlocks,
    steps: stepBlocks,
    videos: videoBlocks,
    keys: keyDiamonds,
    keysAside: chosen.length === 0 ? null : spotsAmountOf(chosen.length),
    borders: borders.borders,
    readout:
      lifted === null
        ? null
        : {
            x: lifted.placement.x,
            y: lifted.placement.y,
            value: formatReadoutTime(lifted.value.seconds),
            detail: waveReadoutDetailOf(countAt(segments, lifted.value.seconds), lifted.value.tier),
          },
  };
};
