import type { KkStudioFSegment, KkStudioFTurn } from '@furria/ui/studio-f-types';
import { useEffect, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep, stepRangeOf } from '@/features/act-player/music-timeline';
import type { Studio, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { studioFSegmentLabelOf } from '../studio-f-copy';
import type { StudioFView } from '../studio-f-lesson';
import {
  followedStepIndexOf,
  nearestRateOf,
  neighbourIndexOf,
  opensPartAt,
  rateIdOf,
  rateOfId,
  segmentStateOf,
  shownViewOf,
  stepNumberOf,
  turnOf,
} from '../studio-f-lesson';
import { stepVideoOf } from '../studio-f-video';
import { useStudioFKeys } from './use-studio-f-keys';

interface ShownStep {
  index: number;
  turn: KkStudioFTurn;
}

export interface StudioFLesson {
  playback: StudioPlayback;
  step: StudioStep | null;
  number: string;
  partName: string | null;
  segments: KkStudioFSegment[];
  textTurn: KkStudioFTurn;
  mediaTurn: KkStudioFTurn;
  canPrevious: boolean;
  canNext: boolean;
  previous: () => void;
  next: () => void;
  select: (index: number) => void;
  whole: boolean;
  toggleWhole: () => void;
  view: StudioFView;
  chosenView: StudioFView;
  chooseView: (view: StudioFView) => void;
  video: StudioVideo | null;
  mirrored: boolean;
  toggleMirror: () => void;
  rateId: string;
  slowed: boolean;
  chooseRate: (id: string) => void;
  playing: boolean;
  canPlay: boolean;
  failed: boolean;
  toggle: () => void;
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const FIRST_TURN: KkStudioFTurn = { key: 0, direction: 'forward' };

export const useStudioFLesson = (studio: Studio, viewerId: number | null): StudioFLesson => {
  const playback = useStudioPlayback(studio, viewerId);
  const { steps, parts, player, state, controls } = playback;
  const [selected, setSelected] = useState(0);
  const [whole, setWhole] = useState(false);
  const [chosenView, setChosenView] = useState<StudioFView>('video');
  const [mirrored, setMirrored] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mediaTurn, setMediaTurn] = useState<KkStudioFTurn>(FIRST_TURN);
  const followed = usePlaybackSelection(player, (seconds) => followedStepIndexOf(steps, seconds));
  const index = whole ? followed : Math.min(selected, steps.length - 1);
  const step = steps[index] ?? null;
  const [shown, setShown] = useState<ShownStep>({ index, turn: FIRST_TURN });

  if (shown.index !== index) {
    setShown({
      index,
      turn: { key: shown.turn.key + 1, direction: turnOf(shown.index, index) },
    });
  }

  const loop = whole || step === null ? null : stepRangeOf(step);
  const loopStart = loop?.start ?? null;
  const loopEnd = loop?.end ?? null;

  useEffect(() => {
    player.setLoop(
      loopStart === null || loopEnd === null ? null : { start: loopStart, end: loopEnd },
    );
  }, [player, loopStart, loopEnd]);

  const go = (target: number): void => {
    const destination = steps[target];

    if (destination === undefined || destination.startSeconds === null) {
      return;
    }

    setMediaTurn({ key: mediaTurn.key + 1, direction: turnOf(index, target) });

    if (whole) {
      controls.seek(destination.startSeconds);
      return;
    }

    setSelected(target);
    player.setLoop(stepRangeOf(destination));
    controls.seek(destination.startSeconds);
  };

  const previousIndex = neighbourIndexOf(index, steps.length, -1);
  const nextIndex = neighbourIndexOf(index, steps.length, 1);
  const previous = (): void => {
    if (previousIndex !== null) {
      go(previousIndex);
    }
  };
  const next = (): void => {
    if (nextIndex !== null) {
      go(nextIndex);
    }
  };
  const canPlay = state.load === 'ready';

  useStudioFKeys({ onToggle: controls.toggle, onPrevious: previous, onNext: next, canPlay });

  const video = stepVideoOf(studio.videos, parts, step);
  const rate = nearestRateOf(state.rate);
  const part = step === null ? null : partOfStep(parts, step.stepId);

  return {
    playback,
    step,
    number: stepNumberOf(Math.max(0, index)),
    partName: part?.name ?? null,
    segments: steps.map((candidate, position) => ({
      key: `${candidate.stepId}`,
      label: studioFSegmentLabelOf(position + 1, candidate.name),
      state: segmentStateOf(position, index),
      opensPart: opensPartAt(steps, parts, position),
    })),
    textTurn: shown.turn,
    mediaTurn,
    canPrevious: previousIndex !== null,
    canNext: nextIndex !== null,
    previous,
    next,
    select: (target) => {
      if (target !== index) {
        go(target);
        return;
      }
      const start = step?.startSeconds ?? null;
      if (start !== null) {
        controls.seek(start);
      }
    },
    whole,
    toggleWhole: () => {
      if (whole) {
        setSelected(Math.max(0, followed));
      }
      setWhole(!whole);
    },
    view: shownViewOf(chosenView, video !== null),
    chosenView,
    chooseView: setChosenView,
    video,
    mirrored,
    toggleMirror: () => {
      setMirrored(!mirrored);
    },
    rateId: rateIdOf(rate),
    slowed: rate < 1,
    chooseRate: (id) => {
      controls.setRate(rateOfId(id));
    },
    playing: state.playing,
    canPlay,
    failed: state.load === 'failed',
    toggle: controls.toggle,
    sheetOpen,
    openSheet: () => {
      setSheetOpen(true);
    },
    closeSheet: () => {
      setSheetOpen(false);
    },
  };
};
