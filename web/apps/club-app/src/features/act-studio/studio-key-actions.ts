import { neighbourCountOf } from '@furria/studio/music-timeline';
import type { StudioKeyActions } from '@furria/studio/studio-keys';
import type { StudioScreen } from './hooks/use-studio-screen';

export type ZoomBy = (direction: 1 | -1) => void;

export const scrubKeyActionsOf = (screen: StudioScreen, zoom: ZoomBy | null): StudioKeyActions => {
  const { practice, playback } = screen;
  const seekCount = (direction: 1 | -1): void => {
    const target = neighbourCountOf(playback.countMarks, playback.player.position(), direction);
    if (target !== null) {
      playback.player.seek(target);
    }
  };

  return {
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
    zoomIn:
      zoom === null
        ? null
        : () => {
            zoom(1);
          },
    zoomOut:
      zoom === null
        ? null
        : () => {
            zoom(-1);
          },
  };
};
