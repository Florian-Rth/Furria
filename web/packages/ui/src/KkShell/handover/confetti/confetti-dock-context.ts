import { createContext, useContext } from 'react';
import { useKkShellScroll } from '../../internal/logic/shell-scroll';
import { DOCK_TRAVEL, dockProgressAt } from './dock-flight';
import { DOCK_SLOT_TITLE_SELECTOR } from './measure-dock';

export interface ConfettiDock {
  isDocked: () => boolean;
  replayLanding: () => void;
}

export const DOCK_REPLAY_EVENT = 'kk-dock-replay';

const DOCKED_PROGRESS = 1;

const UNDOCKED: ConfettiDock = {
  isDocked: () => false,
  replayLanding: () => undefined,
};

export const ConfettiDockContext = createContext<ConfettiDock>(UNDOCKED);

export const useConfettiDock = (): ConfettiDock => useContext(ConfettiDockContext);

const replayDockLanding = (): void => {
  document
    .querySelector(DOCK_SLOT_TITLE_SELECTOR)
    ?.dispatchEvent(new Event(DOCK_REPLAY_EVENT, { bubbles: true }));
};

export const useConfettiDockLink = (): ConfettiDock => {
  const { scrollY } = useKkShellScroll();

  return {
    isDocked: () => dockProgressAt(scrollY.get(), DOCK_TRAVEL) >= DOCKED_PROGRESS,
    replayLanding: replayDockLanding,
  };
};
