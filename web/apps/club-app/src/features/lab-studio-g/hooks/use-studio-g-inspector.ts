import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep } from '@/features/act-player/music-timeline';
import { eightsOf, isFilmed } from '@/features/act-practice/practice-step-list';
import type { StudioSpot } from '@/features/acts/schemas';
import {
  ACT_EYEBROW,
  ACTION_EARLIER,
  ACTION_EARLIER_LABEL,
  ACTION_JUMP,
  ACTION_LATER,
  ACTION_LATER_LABEL,
  ACTION_LOOP,
  ACTION_RESET,
  depthTextOf,
  easingTextOf,
  eightsTextOf,
  FACT_BEND,
  FACT_CUT,
  FACT_DEPTH,
  FACT_EASING,
  FACT_END,
  FACT_FACING,
  FACT_FILE_LENGTH,
  FACT_FINAL,
  FACT_FIRST_BEAT,
  FACT_IN_MIX,
  FACT_LENGTH,
  FACT_MAIN_VIDEO,
  FACT_NOW,
  FACT_PART,
  FACT_PARTS,
  FACT_PERSON,
  FACT_RANGE,
  FACT_ROLE,
  FACT_SIDE,
  FACT_SONGS,
  FACT_SPOTS,
  FACT_STAGE,
  FACT_START,
  FACT_STATE,
  FACT_STEPS,
  FACT_TEMPO,
  FACT_VIDEO,
  FACT_VIDEOS,
  FACT_WAYPOINTS,
  facingTextOf,
  INSPECTOR_IDLE_HINT,
  KEYFRAME_HINT,
  KEYFRAME_SLOTS,
  keyframeEyebrowOf,
  keyframeTitleOf,
  PART_SLOTS,
  personNameOf,
  SONG_SLOTS,
  SPOT_HINT,
  SPOT_SLOTS,
  STEP_FIRST_HINT,
  STEP_HINT,
  STEP_SLOTS,
  secondsTextOf,
  sideTextOf,
  songEyebrowOf,
  spanOf,
  spotNumbersOf,
  spotsCountTextOf,
  spotsTitleOf,
  spotTitleOf,
  stageTextOf,
  stepEyebrowOf,
  stepsOfPartTextOf,
  tempoTextOf,
  timecodeOf,
  VALUE_ALTERNATIVE,
  VALUE_FAILED,
  VALUE_FILMED,
  VALUE_FREE,
  VALUE_MAIN,
  VALUE_MOVING,
  VALUE_NO,
  VALUE_NONE,
  VALUE_NONE_ONE,
  VALUE_OUTDATED,
  VALUE_PROCESSING,
  VALUE_READY,
  VALUE_STILL,
  VALUE_UNFILMED,
  VALUE_YES,
  VIDEO_HINT,
  VIDEO_SLOTS,
  videoEyebrowOf,
  videoTitleOf,
} from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { clampedVideoStartOf, keyframeKeyOf } from '../studio-g-edits';
import type { InspectorAction, InspectorFact, InspectorModel } from '../studio-g-inspector-model';
import { factOf } from '../studio-g-inspector-model';
import { songBlocksOf, songNameOf } from '../studio-g-lanes';
import { isSameRange, selectionRangeOf } from '../studio-g-ranges';
import type { StudioGSelection } from '../studio-g-selection';
import { NO_SELECTION } from '../studio-g-selection';
import { countReadingAt } from '../studio-g-timeline';

const NUDGE_SECONDS = 0.1;
const SAME_MOMENT_SECONDS = 0.01;
const READING_GRAIN = 10;
const NO_SLOTS: readonly string[] = [];

export interface StudioGInspector {
  open: boolean;
  idle: InspectorModel;
  shown: InspectorModel | null;
  close: () => void;
}

const stateTextOf = (state: string): string => {
  if (state === 'ready') {
    return VALUE_READY;
  }

  return state === 'failed' ? VALUE_FAILED : VALUE_PROCESSING;
};

const personOf = (spot: StudioSpot | undefined): string =>
  spot?.person == null ? VALUE_FREE : personNameOf(spot.person.firstName, spot.person.lastName);

const keyframeCountOf = (path: SpotPath | undefined): number => path?.keyframes.length ?? 0;

export const useStudioGInspector = (desk: StudioGDesk): StudioGInspector => {
  const { playback, studio, edits, picked, actName } = desk;
  const { player, state, segments, steps, parts, countMarks, paths, stage, length } = playback;
  const { selection } = picked;
  const [last, setLast] = useState<StudioGSelection>(NO_SELECTION);

  if (selection.kind !== 'none' && selection !== last) {
    setLast(selection);
  }

  const shownSelection = selection.kind === 'none' ? last : selection;
  const live = shownSelection.kind === 'spots';
  const moment = usePlaybackSelection(player, (seconds) =>
    live ? Math.round(seconds * READING_GRAIN) / READING_GRAIN : 0,
  );

  const jumpAction = (range: TimelineRange | null): InspectorAction[] =>
    range === null
      ? []
      : [
          {
            key: 'jump',
            glyph: 'jump',
            text: ACTION_JUMP,
            press: () => {
              player.seek(range.start);
            },
          },
          {
            key: 'loop',
            glyph: 'loop',
            text: ACTION_LOOP,
            pressed: isSameRange(state.loop, range),
            press: () => {
              if (isSameRange(player.state().loop, range)) {
                player.setLoop(null);
                return;
              }
              player.setLoop(range);
              player.seek(range.start);
            },
          },
        ];

  const rangeOf = (target: StudioGSelection): TimelineRange | null =>
    selectionRangeOf(target, { segments, steps, parts, videos: studio.videos });

  const base = {
    note: null,
    hint: null,
    poster: null,
    changed: false,
    slots: NO_SLOTS,
  };

  const openSpots = studio.spots.filter((spot) => spot.person === null).length;
  const idle: InspectorModel = {
    ...base,
    key: 'act',
    kind: 'act',
    eyebrow: ACT_EYEBROW,
    title: actName,
    hint: INSPECTOR_IDLE_HINT,
    facts: [
      factOf('length', FACT_LENGTH, timecodeOf(length)),
      factOf('songs', FACT_SONGS, String(studio.songs.length)),
      factOf('parts', FACT_PARTS, String(parts.length)),
      factOf('steps', FACT_STEPS, String(steps.length)),
      factOf('spots', FACT_SPOTS, spotsCountTextOf(studio.spots.length, openSpots)),
      factOf('videos', FACT_VIDEOS, String(studio.videos.length)),
      factOf('stage', FACT_STAGE, stageTextOf(stage.widthMetres, stage.depthMetres)),
    ],
    actions: [],
  };

  const songModel = (mediaItemId: number): InspectorModel | null => {
    const song = studio.songs.find((candidate) => candidate.mediaItemId === mediaItemId);
    const block = songBlocksOf(segments, studio.songs).find(
      (candidate) => candidate.mediaItemId === mediaItemId,
    );
    if (song === undefined || block === undefined) {
      return null;
    }
    const final = studio.finalTracks.find((track) => track.adopted);
    const facts: InspectorFact[] = [
      factOf('mix', FACT_IN_MIX, spanOf(block.start, block.end)),
      factOf('cut', FACT_CUT, spanOf(song.startSeconds, song.endSeconds)),
      factOf(
        'file',
        FACT_FILE_LENGTH,
        song.durationSeconds === null ? '–' : timecodeOf(song.durationSeconds),
      ),
      factOf('tempo', FACT_TEMPO, tempoTextOf(song.tempoBpm)),
      factOf(
        'first',
        FACT_FIRST_BEAT,
        song.firstBeatSeconds === null ? '–' : timecodeOf(song.firstBeatSeconds),
      ),
      factOf(
        'final',
        FACT_FINAL,
        final === undefined ? VALUE_NONE : `${final.version}`,
        final === undefined ? 'quiet' : 'plain',
      ),
      factOf(
        'state',
        FACT_STATE,
        stateTextOf(song.state),
        song.state === 'ready' ? 'plain' : 'attention',
      ),
    ];

    return {
      ...base,
      key: `song-${mediaItemId}`,
      kind: 'song',
      eyebrow: songEyebrowOf(block.number, studio.songs.length),
      title: songNameOf(song.fileName),
      facts,
      actions: jumpAction({ start: block.start, end: block.end }),
      slots: SONG_SLOTS,
    };
  };

  const partModel = (partId: number): InspectorModel | null => {
    const part = parts.find((candidate) => candidate.partId === partId);
    const range = rangeOf({ kind: 'part', partId });
    if (part === undefined || range === null) {
      return null;
    }
    const numbers = steps
      .map((step, index) => ({ step, number: index + 1 }))
      .filter(({ step }) => part.stepIds.includes(step.stepId))
      .map(({ number }) => number);
    const main = studio.videos.find((video) => video.videoId === part.mainVideoId);

    return {
      ...base,
      key: `part-${partId}`,
      kind: 'part',
      eyebrow: FACT_PART,
      title: part.name,
      facts: [
        factOf('range', FACT_RANGE, spanOf(range.start, range.end)),
        factOf(
          'length',
          FACT_LENGTH,
          `${secondsTextOf(range.end - range.start)}${eightsTextOf(eightsOf(countMarks, range))}`,
        ),
        factOf(
          'steps',
          FACT_STEPS,
          stepsOfPartTextOf(numbers.length, numbers[0] ?? 0, numbers.at(-1) ?? 0),
        ),
        factOf(
          'main',
          FACT_MAIN_VIDEO,
          main === undefined ? VALUE_NONE_ONE : videoTitleOf(main.name),
          main === undefined ? 'quiet' : 'plain',
        ),
      ],
      actions: jumpAction(range),
      slots: PART_SLOTS,
    };
  };

  const stepModel = (stepId: number): InspectorModel | null => {
    const index = steps.findIndex((candidate) => candidate.stepId === stepId);
    const step = steps[index];
    const range = rangeOf({ kind: 'step', stepId });
    if (step === undefined || range === null) {
      return null;
    }
    const part = partOfStep(parts, stepId);
    const changed = edits.borders.has(stepId) || edits.borders.has(steps[index + 1]?.stepId ?? -1);
    const reset: InspectorAction[] = changed
      ? [
          {
            key: 'reset',
            glyph: 'reset',
            text: ACTION_RESET,
            press: () => {
              edits.setBorder(stepId, null);
              const next = steps[index + 1];
              if (next !== undefined) {
                edits.setBorder(next.stepId, null);
              }
            },
          },
        ]
      : [];

    return {
      ...base,
      key: `step-${stepId}`,
      kind: 'step',
      eyebrow: stepEyebrowOf(index + 1, part?.name ?? null),
      title: step.name,
      note: step.description,
      hint: index === 0 ? STEP_FIRST_HINT : STEP_HINT,
      changed,
      facts: [
        factOf('range', FACT_RANGE, spanOf(range.start, range.end)),
        factOf(
          'length',
          FACT_LENGTH,
          `${secondsTextOf(range.end - range.start)}${eightsTextOf(eightsOf(countMarks, range))}`,
        ),
        factOf('part', FACT_PART, part?.name ?? VALUE_NONE_ONE, part === null ? 'quiet' : 'plain'),
        factOf('video', FACT_VIDEO, isFilmed(studio.videos, range) ? VALUE_FILMED : VALUE_UNFILMED),
      ],
      actions: [...jumpAction(range), ...reset],
      slots: STEP_SLOTS,
    };
  };

  const videoModel = (videoId: number): InspectorModel | null => {
    const video = studio.videos.find((candidate) => candidate.videoId === videoId);
    const range = rangeOf({ kind: 'video', videoId });
    if (video === undefined) {
      return null;
    }
    const mainOf = parts.find((part) => part.mainVideoId === videoId)?.name ?? null;
    const start = video.startSeconds ?? 0;
    const nudge = (delta: number) => (): void => {
      edits.setVideoStart(videoId, clampedVideoStartOf(start + delta, length));
    };
    const changed = edits.videoStarts.has(videoId);
    const reset: InspectorAction[] = changed
      ? [
          {
            key: 'reset',
            glyph: 'reset',
            text: ACTION_RESET,
            press: () => {
              edits.setVideoStart(videoId, null);
            },
          },
        ]
      : [];

    return {
      ...base,
      key: `video-${videoId}`,
      kind: 'video',
      eyebrow: videoEyebrowOf(mainOf),
      title: videoTitleOf(video.name),
      hint: VIDEO_HINT,
      poster: video.urls.poster,
      changed,
      facts: [
        factOf('start', FACT_START, range === null ? '–' : timecodeOf(range.start)),
        factOf('end', FACT_END, range === null ? '–' : timecodeOf(range.end)),
        factOf(
          'length',
          FACT_LENGTH,
          video.durationSeconds === null ? '–' : secondsTextOf(video.durationSeconds),
        ),
        factOf('role', FACT_ROLE, mainOf === null ? VALUE_ALTERNATIVE : VALUE_MAIN),
        factOf(
          'state',
          FACT_STATE,
          video.outdated ? VALUE_OUTDATED : stateTextOf(video.state),
          video.outdated || video.state !== 'ready' ? 'attention' : 'plain',
        ),
      ],
      actions: [
        {
          key: 'earlier',
          glyph: 'earlier',
          text: ACTION_EARLIER,
          label: ACTION_EARLIER_LABEL,
          press: nudge(-NUDGE_SECONDS),
        },
        {
          key: 'later',
          glyph: 'later',
          text: ACTION_LATER,
          label: ACTION_LATER_LABEL,
          press: nudge(NUDGE_SECONDS),
        },
        ...jumpAction(range),
        ...reset,
      ],
      slots: VIDEO_SLOTS,
    };
  };

  const spotsModel = (spotIds: readonly number[]): InspectorModel | null => {
    const chosen = studio.spots.filter((spot) => spotIds.includes(spot.spotId));
    const first = chosen[0];
    if (first === undefined) {
      return null;
    }
    const changedKeys = [...edits.moves.keys()].filter((key) =>
      spotIds.some((spotId) => key.startsWith(`${spotId}:`)),
    );
    const reset: InspectorAction[] =
      changedKeys.length === 0
        ? []
        : [
            {
              key: 'reset',
              glyph: 'reset',
              text: ACTION_RESET,
              press: () => {
                edits.clearMoves(changedKeys);
              },
            },
          ];
    const common = {
      ...base,
      key: `spots-${spotIds.join('-')}`,
      hint: SPOT_HINT,
      changed: changedKeys.length > 0,
      actions: reset,
      slots: SPOT_SLOTS,
    };

    if (chosen.length > 1) {
      return {
        ...common,
        kind: 'spots',
        eyebrow: FACT_SPOTS,
        title: spotsTitleOf(chosen.length),
        facts: [
          factOf('numbers', FACT_SPOTS, spotNumbersOf(chosen.map((spot) => spot.number))),
          factOf('open', VALUE_FREE, String(chosen.filter((spot) => spot.person === null).length)),
        ],
      };
    }

    const path = paths.find((candidate) => candidate.spotId === first.spotId);
    const pose = path === undefined ? null : poseAt(path, moment);

    return {
      ...common,
      kind: 'spot',
      eyebrow: spotTitleOf(first.number),
      title: personOf(first),
      facts: [
        factOf(
          'person',
          FACT_PERSON,
          personOf(first),
          first.person === null ? 'attention' : 'plain',
        ),
        factOf('side', FACT_SIDE, pose === null ? '–' : sideTextOf(pose.position.rightMetres)),
        factOf('depth', FACT_DEPTH, pose === null ? '–' : depthTextOf(pose.position.backMetres)),
        factOf('facing', FACT_FACING, facingTextOf(pose?.facingDegrees ?? null)),
        factOf('now', FACT_NOW, pose?.moving === true ? VALUE_MOVING : VALUE_STILL),
        factOf('waypoints', FACT_WAYPOINTS, String(keyframeCountOf(path))),
      ],
    };
  };

  const keyframeModel = (seconds: number, spotIds: readonly number[]): InspectorModel => {
    const shownPaths =
      spotIds.length === 0 ? paths : paths.filter((path) => spotIds.includes(path.spotId));
    const hits = shownPaths.flatMap((path) => {
      const index = path.keyframes.findIndex(
        (keyframe) => Math.abs(keyframe.seconds - seconds) < SAME_MOMENT_SECONDS,
      );
      const keyframe = path.keyframes[index];

      return keyframe === undefined ? [] : [{ spotId: path.spotId, index, keyframe }];
    });
    const sample = hits[0]?.keyframe ?? null;
    const numbers = hits
      .map((hit) => studio.spots.find((spot) => spot.spotId === hit.spotId)?.number ?? 0)
      .sort((left, right) => left - right);

    return {
      ...base,
      key: `keyframe-${seconds}-${spotIds.join('-')}`,
      kind: 'keyframe',
      eyebrow: keyframeEyebrowOf(seconds),
      title: keyframeTitleOf(countReadingAt(countMarks, seconds), seconds),
      hint: KEYFRAME_HINT,
      changed: hits.some((hit) => edits.moves.has(keyframeKeyOf(hit.spotId, hit.index))),
      facts: [
        factOf(
          'spots',
          FACT_SPOTS,
          numbers.length === studio.spots.length ? String(numbers.length) : spotNumbersOf(numbers),
        ),
        factOf('easing', FACT_EASING, easingTextOf(sample?.easing ?? null)),
        factOf(
          'bend',
          FACT_BEND,
          hits.some((hit) => hit.keyframe.bend !== null) ? VALUE_YES : VALUE_NO,
        ),
        factOf('facing', FACT_FACING, facingTextOf(sample?.facingDegrees ?? null)),
      ],
      actions: [],
      slots: KEYFRAME_SLOTS,
    };
  };

  const modelOf = (target: StudioGSelection): InspectorModel | null => {
    switch (target.kind) {
      case 'song':
        return songModel(target.mediaItemId);
      case 'part':
        return partModel(target.partId);
      case 'step':
        return stepModel(target.stepId);
      case 'video':
        return videoModel(target.videoId);
      case 'spots':
        return spotsModel(target.spotIds);
      case 'keyframe':
        return keyframeModel(target.seconds, target.spotIds);
      default:
        return null;
    }
  };

  return {
    open: selection.kind !== 'none',
    idle,
    shown: modelOf(shownSelection),
    close: picked.clear,
  };
};
