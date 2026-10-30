import { useEffect, useRef } from 'react';
import { historyKeyOf } from '@/features/act-studio/studio-history-keys';
import { countTargetOf, stepTargetOf } from '../count-sheet';
import { deskKeyOf } from '../sheet-moves';
import type { EightsStudio } from './use-eights-studio';

const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROLS = 'button, a[href], [role="button"], [role="slider"], [role="switch"]';

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

const isControlTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest(CONTROLS) !== null;

const pressOn = (studio: EightsStudio, event: KeyboardEvent): void => {
  const { screen, history, zoom } = studio;
  const { player, steps, countMarks } = screen.playback;
  const stroke = {
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    typing: isTypingTarget(event.target),
    control: isControlTarget(event.target),
  };
  const historyKey = event.repeat ? null : historyKeyOf(stroke);
  if (historyKey === 'undo' && history.canUndo) {
    event.preventDefault();
    history.undo();
    return;
  }
  if (historyKey === 'redo' && history.canRedo) {
    event.preventDefault();
    history.redo();
    return;
  }
  const deskKey = deskKeyOf(stroke);
  if (deskKey === null) {
    return;
  }
  event.preventDefault();
  if (deskKey === 'toggle') {
    if (!event.repeat) {
      screen.practice.toggle();
    }
    return;
  }
  if (deskKey === 'zoomIn' || deskKey === 'zoomOut') {
    zoom(deskKey === 'zoomIn' ? -1 : 1);
    return;
  }
  const direction = deskKey === 'stepBack' || deskKey === 'countBack' ? -1 : 1;
  const at = player.position();
  const starts = steps.flatMap((step) => (step.startSeconds === null ? [] : [step.startSeconds]));
  const target =
    deskKey === 'countBack' || deskKey === 'countForward'
      ? countTargetOf(countMarks, at, direction)
      : stepTargetOf(starts, at, direction);
  if (target !== null) {
    player.seek(target);
  }
};

export const useEightsKeys = (studio: EightsStudio): void => {
  const latest = useRef(studio);

  useEffect(() => {
    latest.current = studio;
  });

  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      if (!event.defaultPrevented) {
        pressOn(latest.current, event);
      }
    };

    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, []);
};
