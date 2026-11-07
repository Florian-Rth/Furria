import type { CentreTarget } from '@furria/studio/centre-targets';
import { clockOf, keyLabelOf, videoBlockLabelOf } from '@furria/studio/desk-copy';
import { KEY_MATCH_SECONDS, keyedSpotsAt, keyTimesOf } from '@furria/studio/desk-keyframes';
import { musicTicksOf } from '@furria/studio/desk-time';
import { videoNameOf } from '@furria/studio/studio-copy';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';
import { videoNumberOf } from '@furria/studio/studio-videos';
import type {
  TimelineBlock,
  TimelineDiamond,
  TimelineHandle,
  TimelineMark,
  TimelinePart,
  TimelineStep,
} from '@furria/studio/Timeline';
import { timelineRowsOf } from '@furria/studio/timeline-rows';
import type { ActDesk } from '@furria/studio/use-act-desk';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import { useDeskKeyDrag } from '@furria/studio/use-desk-key-drag';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';

interface DeskTarget extends CentreTarget {
  start?: () => void;
  move?: (seconds: number) => void;
  end?: (seconds: number) => void;
  cancel?: () => void;
  tap?: () => void;
}

export interface DeskLaneRows {
  centre: CentreScrub;
  beats: TimelineMark[];
  parts: TimelinePart[];
  steps: TimelineStep[];
  currentStepId: number | null;
  selectedStepId: number | null;
  videos: TimelineBlock[];
  keys: TimelineDiamond[];
  borders: TimelineHandle[];
  readout: WaveReadout | null;
}

const isNear = (left: number | null, right: number): boolean =>
  left !== null && Math.abs(left - right) <= KEY_MATCH_SECONDS;

interface Spanned {
  key: number;
  range: { start: number; end: number } | null;
}

const spanTargetsOf = (
  spans: readonly Spanned[],
  lane: string,
  tap: (key: number) => void,
): DeskTarget[] =>
  spans.flatMap(({ key, range }) =>
    range === null
      ? []
      : [
          {
            key: `${lane}-${key}`,
            seconds: range.start,
            until: range.end,
            lane,
            movable: false,
            tappable: true,
            tap: () => {
              tap(key);
            },
          },
        ],
  );

export const useDeskLanes = (desk: ActDesk, borders: DeskBorders): DeskLaneRows => {
  const { screen, editor, takes, focus, partId, keySeconds } = desk;
  const { playback, practice, studio } = screen;
  const { length, countMarks, paths, segments } = playback;
  const movable = screen.evening === null;
  const currentId = practice.step?.stepId ?? null;
  const chosen = paths.filter((path) => editor.selected.includes(path.spotId));
  const shownPaths = chosen.length > 0 ? chosen : paths;
  const keyDrag = useDeskKeyDrag(desk, shownPaths);
  const rows = timelineRowsOf(
    screen.studio,
    paths,
    countMarks,
    currentId,
    focus === 'part' ? partId : null,
  );

  const videoTargets: DeskTarget[] = takes.bars.map((bar) => ({
    key: `video-${bar.key}`,
    seconds: bar.startSeconds,
    until: bar.endSeconds,
    lane: TIMELINE_LANE.videos,
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
  }));

  const videoBlocks: TimelineBlock[] = takes.bars.map((bar, index) => {
    const video = studio.videos.find((candidate) => String(candidate.videoId) === bar.key);
    const number = video === undefined ? 0 : videoNumberOf(studio.videos, video.videoId);
    const name = videoNameOf(video?.name ?? null, number);
    const target = videoTargets[index];

    return {
      key: `video-${bar.key}`,
      range: { start: target?.seconds ?? 0, end: target?.until ?? 0 },
      lead: null,
      title: name,
      meta: clockOf(bar.endSeconds - bar.startSeconds),
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
    lane: TIMELINE_LANE.keys,
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
    lane: TIMELINE_LANE.steps,
    move: border.move,
    end: border.end,
    cancel: border.end,
  }));

  const targets: DeskTarget[] = [
    ...spanTargetsOf(rows.parts, TIMELINE_LANE.parts, desk.focusPart),
    ...spanTargetsOf(rows.steps, TIMELINE_LANE.steps, desk.focusStep),
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

  return {
    centre,
    beats: musicTicksOf(countMarks, centre.pxPerSecond),
    parts: rows.parts,
    steps: rows.steps,
    currentStepId: currentId,
    selectedStepId: focus === 'step' ? currentId : null,
    videos: videoBlocks,
    keys: keyDiamonds,
    borders: borders.borders,
    readout: waveReadoutOf(centre.readout, segments),
  };
};
