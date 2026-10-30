import { useEffect } from 'react';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { LaneKey } from '../lane-keys';
import { laneKeyOf } from '../lane-keys';
import { neighbourCountOf } from '../lane-time';

const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROL_SELECTOR = 'button, [role="button"], [role="slider"], [role="tab"], a';

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

const isControl = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest(CONTROL_SELECTOR) !== null;

export const useLaneKeys = (
  screen: StudioScreen,
  zoom: ((direction: 1 | -1) => void) | null,
): void => {
  const { practice, playback } = screen;

  useEffect(() => {
    const seekCount = (direction: 1 | -1): void => {
      const target = neighbourCountOf(playback.countMarks, playback.player.position(), direction);
      if (target !== null) {
        playback.player.seek(target);
      }
    };
    const actions: Record<LaneKey, () => void> = {
      toggle: practice.toggle,
      stepBack: () => {
        practice.skip('back');
      },
      stepForward: () => {
        practice.skip('forward');
      },
      countBack: () => {
        seekCount(-1);
      },
      countForward: () => {
        seekCount(1);
      },
      zoomIn: () => {
        zoom?.(1);
      },
      zoomOut: () => {
        zoom?.(-1);
      },
    };
    const press = (event: KeyboardEvent): void => {
      const key = laneKeyOf({
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        typing: isTyping(event.target),
        onControl: isControl(event.target),
      });
      if (key === null || event.defaultPrevented) {
        return;
      }
      event.preventDefault();
      actions[key]();
    };
    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [practice, playback, zoom]);
};
