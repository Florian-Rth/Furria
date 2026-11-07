import { clockOf } from '@furria/studio/desk-copy';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import { useState } from 'react';
import type { SetupBorder } from '../setup-borders';
import { bordersInRangeOf, chosenBorderOf, neighbourBorderOf, tapMarksOf } from '../setup-borders';
import {
  SS_TAP,
  SS_TAP_HINT,
  SS_TAP_LABEL,
  SS_TUNE_DELETE,
  SS_TUNE_EARLIER,
  SS_TUNE_EARLIER_LABEL,
  SS_TUNE_LATER,
  SS_TUNE_LATER_LABEL,
  tuneTitleOf,
  videoStepsOf,
} from '../setup-copy';
import type { SetupTask, SetupTool } from '../setup-task';
import { toolOf } from '../setup-task';
import type { SetupTarget, SetupTimeline } from './use-setup-timeline';
import { useSetupTimeline } from './use-setup-timeline';
import type { StepSetup } from './use-step-setup';

const MATCH_SECONDS = 0.05;

export interface BigTap {
  text: string;
  meta: string;
  label: string;
  disabled: boolean;
  press: () => void;
}

export interface BorderTune {
  title: string;
  previous: (() => void) | null;
  next: (() => void) | null;
  earlier: SetupTool;
  later: SetupTool;
  remove: SetupTool;
}

export interface SetupBorders {
  task: SetupTask;
  tap: BigTap;
  tune: BorderTune | null;
  timeline: SetupTimeline;
}

export const useSetupBorders = (setup: StepSetup): SetupBorders => {
  const { screen, range, steps, videoSteps } = setup;
  const { playback, practice } = screen;
  const work = screen.document;
  const { player, length, countMarks } = playback;
  const desk = useDeskBorders(screen);
  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const [tappedAt, setTappedAt] = useState<number | null>(null);
  const borders = range === null ? [] : bordersInRangeOf(steps, range);
  const tapped =
    tappedAt === null
      ? undefined
      : borders.find((border) => Math.abs(border.seconds - tappedAt) < MATCH_SECONDS);
  if (tapped !== undefined) {
    setTappedAt(null);
    setChosenKey(tapped.key);
  }
  const chosen = chosenBorderOf(borders, chosenKey);
  const numberOf = (stepId: number): number =>
    steps.findIndex((step) => step.stepId === stepId) + 1;

  const loopAround = (border: SetupBorder): void => {
    const before = steps.find((step) => step.stepId === border.beforeId);
    const after = steps.find((step) => step.stepId === border.afterId);
    if (before === undefined || after === undefined) {
      return;
    }
    player.setLoop({ start: before.start, end: after.end });
    player.seek(before.start);
    player.play();
  };
  const choose = (border: SetupBorder): void => {
    setChosenKey(border.key);
    loopAround(border);
  };
  const chooseKey = (key: string): void => {
    const border = borders.find((candidate) => candidate.key === key);
    if (border !== undefined) {
      choose(border);
    }
  };
  const borderTargets: SetupTarget[] = desk.borders.map((border) => ({
    key: border.key,
    seconds: border.seconds,
    lane: TIMELINE_LANE.steps,
    tappable: true,
    move: border.move,
    end: border.end,
    cancel: border.end,
    tap: () => {
      chooseKey(border.key);
    },
  }));
  const timeline = useSetupTimeline(setup, {
    targets: borderTargets,
    startAt: range?.start ?? null,
    borders: desk.borders,
  });

  const tap = (): void => {
    if (range === null) {
      return;
    }
    const marks = tapMarksOf({
      starts: steps.map((step) => step.start),
      counts: practice.playing ? countMarks : [],
      videoStart: range.start,
      videoEnd: range.end,
      seconds: player.position(),
      length,
    });
    if (marks.length === 0) {
      return;
    }
    player.setLoop(null);
    work.startGesture();
    for (const at of marks) {
      work.mark(at, length);
    }
    work.endGesture();
    setTappedAt(marks.find((at) => Math.abs(at - player.position()) < 1) ?? marks[0] ?? null);
  };

  const tuneOf = (border: SetupBorder): BorderTune => {
    const nudge = desk.borders.find((candidate) => candidate.key === border.key);
    const previous = neighbourBorderOf(borders, border.key, -1);
    const next = neighbourBorderOf(borders, border.key, 1);
    const shift =
      (direction: -1 | 1): (() => void) =>
      () => {
        nudge?.onNudge(direction);
        loopAround(border);
      };

    return {
      title: tuneTitleOf(numberOf(border.beforeId), clockOf(border.seconds)),
      previous:
        previous === null
          ? null
          : () => {
              choose(previous);
            },
      next:
        next === null
          ? null
          : () => {
              choose(next);
            },
      earlier: toolOf('earlier', SS_TUNE_EARLIER, shift(-1), SS_TUNE_EARLIER_LABEL),
      later: toolOf('later', SS_TUNE_LATER, shift(1), SS_TUNE_LATER_LABEL),
      remove: toolOf('delete', SS_TUNE_DELETE, () => {
        player.setLoop(null);
        setChosenKey(previous?.key ?? null);
        work.change({ kind: 'stepRemove', stepId: border.afterId });
      }),
    };
  };

  return {
    task: { sentence: SS_TAP_HINT, tools: [], more: [] },
    tap: {
      text: SS_TAP,
      meta: videoStepsOf(videoSteps.length),
      label: SS_TAP_LABEL,
      disabled: range === null || length <= 0,
      press: tap,
    },
    tune: chosen === null ? null : tuneOf(chosen),
    timeline,
  };
};
